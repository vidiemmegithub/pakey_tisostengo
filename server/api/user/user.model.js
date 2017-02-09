'use strict';

const mongoose = require('mongoose'),
      _ = require('lodash'),
      Schema = mongoose.Schema,
      crypto = require('crypto'),
      authTypes = ['github', 'twitter', 'facebook', 'google'],
      config = require('../../config/environment');

let UserSubscriptionSchema = new Schema({
    name: { type: String, enum: Object.keys(config.services) },
    sold_date: { type: Date, default: Date.now },
    sold_price: String,
    deactivation_date: Date,
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    subscriptionId: String,
    billingDetail: {type: Schema.Types.Mixed }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  id: false
});

let UserCarepathSchema = new Schema({
    carepath: { type: Schema.Types.ObjectId, ref: 'Carepath', required: true},
    answers: {
      type: [{
        step: { type: Schema.Types.ObjectId, ref: 'Carepath.Step', required: true},
        text: { type: String, enum: ['yes', 'no'], required: true}
      }],
      required: true
    }
});

/**
 * Virtuals
 */
UserSubscriptionSchema
  .virtual('active')
  .get(function () {
    return (!this.deactivation_date || (this.deactivation_date.getTime() >= Date.now()));
  });
/**
 * Methods
 */
UserSubscriptionSchema.method({
  deactivate: function () {
    let now = new Date(),
        soldDate = this.sold_date;

    this.deactivation_date = new Date(
      now.getFullYear(),
      (now.getDate() >= soldDate.getDate()) ? soldDate.getMonth()+1 : soldDate.getMonth(),
      soldDate.getDate(),
      soldDate.getHours(),
      soldDate.getMinutes(),
      soldDate.getSeconds()
    );
  }
});


let UserSchema = new Schema({
  title: String,
  firstname: { type: String, index: 'text' },
  lastname: { type: String, index: 'text' },
  dateOfBirth: Date,
  picture: String,
  address: String,
  addressNumber: String,
  city: String,
  zipCode: String,
  province: String,
  geocode: {
    placeId: String,
    lat: String,
    lng: String,
    formattedAddress: String
  },
  secondaryAddress: String,
  secondaryAddressNumber: String,
  secondaryCity: String,
  secondaryZipCode: String,
  secondaryProvince: String,
  secondaryGeocode: {
    placeId: String,
    lat: String,
    lng: String,
    formattedAddress: String
  },
  telephone: String,
  banned: { type: Boolean, default: false },
  gender: { type: String, enum: ['M', 'F'], default: 'M' },
  bio: String,
  email: { type: String, lowercase: true },
  role: { type: String, enum: config.userRoles, default: config.userRoles[0], immutable: true },
  hashedPassword: { type: String, immutable: true },
  provider: { type: String, immutable: true },
  salt: { type: String, immutable: true },
  premiumViews: Number,
  facebook: { type: Object, immutable: true },
  registrationPending: { type: Boolean, default: false, immutable: true },
  enablingToken: { type: String, immutable: true },
  payment: {
    type: {
      paypal: {
        profileId: String
      },
      braintree: {
        customerId: String
      }
    }
  },
  subscriptions: {
    type: [UserSubscriptionSchema],
    immutable: true
  },
  specialization: String,
  secondarySpecializations: [String],
  followed: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    immutable: true
  },
  interests: String,
  web: String,
  operationalAddresses: [{
    address: String,
    addressNumber: String,
    city: String,
    zipCode: String,
    province: String,
    geocode: {
      placeId: String,
      lat: String,
      lng: String,
      formattedAddress: String
    }
  }],
  ownerOrCustomerCareRepresentative: String,
  reg_date: { type: Date, immutable: true }, // registration date
  val_date: { type: Date, immutable: true },  // user registration validation date
  usedCoupons: [String],
  agreement: { type: Boolean, default: false },
  carepaths: {
    type: [mongoose.Schema.Types.Mixed]
  }
});


UserSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
    this.enablingToken = this.generateRegistrationToken(password);
  })
  .get(function () {
    return this._password;
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function () {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function (email) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return email.length;
  }, 'Il campo email non può essere vuoto.', 'email_empty');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function (hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return hashedPassword.length;
  }, 'Il campo password non può essere vuoto.');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function (value, respond) {
    var self = this;
    this.constructor.findOne({ email: value }, function (err, user) {
      if (err) {
        throw err;
      }
      if (user) {
        if (self.id === user.id) {
          return respond(true);
        }
        return respond(false);
      }
      respond(true);
    });
  }, 'L\'indirizzo email specificato è già in uso.', 'email_duplicate');

var validatePresenceOf = function (value) {
  return value && value.length;
};

// // Validate carepaths exist
// UserSchema
//   .path('carepaths')
//   .validate(function(value, respond) {
//     console.log(this);

//   }, 'Si è verificato un problema con il salvataggio del questionario', 'carepaths_error');

/**
 * Pre- hooks
 */
UserSchema
  .pre('save', function (next) {
    if (!this.isNew) {
      return next();
    }
    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1) {
      return next(new Error('Password non valida.'));
    }
    // next user needs to skip the registration validation process
    if (this.provider !== 'local' || this.role === 'admin' || this.role === 'editor') {
      this.val_date = this.reg_date;
      this.reg_date = null;
      this.enablingToken = '';
    }
    // remove extra profile data if subscription is not active
    if (!this.checkSubscriptionsState('profile-pro')) {
      this.web = undefined;
      this.secondarySpecializations = undefined;
      this.operationalAddresses = undefined;
    }
    next();
  });
UserSchema
  .post('init', function() {
    // remove extra profile data if subscription is not active
    if (!this.checkSubscriptionsState('profile-pro')) {
      this.web = undefined;
      this.secondarySpecializations = undefined;
      this.operationalAddresses = undefined;
    }
  });

/**
 * Methods
 */
UserSchema.method({
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function () {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function (password) {
    if (!password || !this.salt) {
      return '';
    }
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  },

  generateRegistrationToken: function (password) {
    if (!password) {
      return '';
    }
    var salt = new Buffer(this.makeSalt(), 'base64');
    return encodeURIComponent(crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64'));
  },

  checkSubscriptionsState: function(subscriptionName) {
    let _subscription;

    if (!this.subscriptions) {
      return null;
    }

    _subscription = _.find(this.subscriptions, {name: subscriptionName});
    if (!_subscription) {
      return null;
    }

    return _subscription.active;
  }
});

/**
 * Indexes
 */
// creation of text indexes to perform text $search queries
UserSchema.index({
  'firstname': 'text',
  'lastname': 'text',
  'email': 'text',
  'specialization': 'text',
  'bio': 'text',
  'city': 'text',
  'web': 'text',
  'secondarySpecializations': 'text',
  'operationalAddresses.city': 'text'
}, {
  name: 'text_search',
  default_language: 'italian'
});
// creation of a TTL index used by Mongo to remove users in pending state
UserSchema.index({
  'reg_date': -1
}, { expires: '21 days' });

module.exports = mongoose.model('User', UserSchema);
