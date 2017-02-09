'use strict';

const path = require('path'),
      _ = require('lodash'),
      braintree = require('braintree');

// All configurations will extend these options
// ============================================
let all = {
  env: process.env.NODE_ENV || 'development',

  domain: process.env.DOMAIN || 'http://localhost:9000',

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',


  // List of user roles
  userRoles: ['unqualified', 'qualified', 'editor', 'admin'],

  // List of pay services
  services: {
    'profile-pro': {
      planId: process.env.BRAINTREE_PLAN_PROFILE_PRO_ID || 'g4fg'
    },
    'private-channel-uq': {
      planId: process.env.BRAINTREE_PLAN_PRIVATE_CH_UQ_ID || 'rprm'
    },
    'private-channel-unq': {
      planId: process.env.BRAINTREE_PLAN_PRIVATE_CH_UNQ_ID || '7rsr'
    },
    'ranking': {
      planId: process.env.BRAINTREE_PLAN_RANKING_ID || 'nq62'
    }
  },

  // Should we populate the DB with sample data?
  seedDB: false,

  // MongoDB connection options
  mongo: {
    //URI LOCAL
    uri:  process.env.MONGOLAB_URI || 'mongodb://localhost/tisostengo-dev',

    //URI HEROKU-DEV:
    //uri: process.env.MONGOLAB_URI || 'mongodb://heroku_c9tz39hbK:jbakutq489l3nj76cuodjc5euf@ds015774.mlab.com:15774/heroku_c9tz39hb',

    //URI HEROKU-STAGING:
    //uri: process.env.MONGOLAB_URI || 'mongodb://heroku_tf4qd23r:t2bbeh8ovohbrsctb6bf3rgnah@ds061354.mongolab.com:61354/heroku_tf4qd23r',

    //URI HEROKU-TEST:
    //uri: process.env.MONGOLAB_URI || 'mongodb://heroku_p06b43b2:ntna343vulhqml34ucq41lpt0o@ds037005.mongolab.com:37005/heroku_p06b43b2',

    //URI HEROKU-PROD:
    //uri: process.env.MONGOLAB_URI || 'mongodb://heroku_02j8tqzj:qeeufll1eqlfj7esukurubtgdp@ds049585-a0.mongolab.com:49585,ds049585-a1.mongolab.com:49585/heroku_02j8tqzj?replicaSet=rs-ds049585',

    options: {
      db: {
        safe: true
      }
    }
  },

  secrets: {
    session: 'tisostengo-secret'
  },

  facebook: {
    clientID: process.env.FACEBOOK_ID || '184418585324780',
    clientSecret: process.env.FACEBOOK_SECRET || 'df1c8177bbc2925c7b10c0e7b3c98f7b',
    callbackURL: (process.env.DOMAIN || 'http://localhost:9000') + '/auth/facebook/callback'
  },

  paypal: {
    user: process.env.PAYPAL_MERCHANT_USERNAME || '',
    pwd: process.env.PAYPAL_MERCHANT_PASSWORD || '',
    secret: process.env.PAYPAL_MERCHANT_SIGNATURE || '',
    returnUrl: '/api/payment/paypal/success',
    cancelUrl: '/api/payment/paypal/cancelled'
  },

  braintree: {
    discountTemplate: process.env.BRAINTREE_DISCOUNT_TEMPLATE_ID || 'hcnr',
    environment: braintree.Environment[process.env.BRAINTREE_ENV || 'Sandbox'],
    merchantId: process.env.BRAINTREE_MERCHANT_ID || 'bxvb5nfvz2n5cjc9',
    publicKey: process.env.BRAINTREE_MERCHANT_PUBLIC_KEY || 'g8cxcnkzgkw5vwcw',
    privateKey: process.env.BRAINTREE_MERCHANT_PRIVATE_KEY || '42269072480b966dd4fbdb72505a0b7e'
  },

  aws: {
    uploadsBucketName: process.env.AWS_S3_BUCKET || 'tisostengo-s3',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAII27FXSABE7B5SFA',
    accessKeySecret: process.env.AWS_SECRET_ACCESS_KEY || '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'
  },

  email: {
    host: 'email-smtp.eu-west-1.amazonaws.com',
    port: 465,
    secure: true,
    auth: {
        user: 'AKIAI7ZU2YBIWOAL3DEA',
        pass: 'ApCk9Xyyxg/HykGURwYt0rFCdgTQtV3JWyY6Y3yuJIKm'
    },
    registrationEmailSender: process.env.REGISTRATION_EMAIL_SENDER || 'no-reply@tisostengo.it',
    messagesEmailReceip: process.env.MESSAGES_EMAIL_RECEIP || 'mattia.ugge@vidiemme.it'
  },
  googlemaps:{
    token: process.env.GOOGLE_MAPS_API_TOKEN || 'AIzaSyA3NDA_f6VQX-juS2W55ajd5lEI5tiqT2k'
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(all, {});
