'use strict';

const _ = require('lodash'),
      User = require('../user/user.model'),
      Coupon = require('./coupon.model'),
      generator = require('password-generator'),
      co = require('co'),
      config = require('../../config/environment');

exports.list = function(req, res) {
  Coupon.find(req.filter, req.fields, {limit: req.paging.limit, skip: req.paging.skip, sort: req.sort}, function(err, coupons) {
    if (err) {
      return handleError(res, err);
    }
    
    res.status(200).json({coupons: coupons});
  });
};

exports.show = function(req, res) {
  Coupon.findById(req.params.id, function(err, coupon) {
    if (err) {
      return res.status(404).send("Coupon not found");
    }
    
    res.status(200).json(coupon);
  });
};

exports.verify = function(req, res) {
  co(function*() {
    try {
      let user =yield User.findById(req.user._id),
          coupon = yield Coupon.findOne({text: req.params.text});
      
      if (!coupon) {
        return handleError(res, "Coupon non esistente");
      }
      if (coupon.enabled === false) {
        return handleError(res, "Coupon non valido");
      }
      if (coupon.service !== req.params.service) {
        return handleError(res, "Coupon non utilizzabile per questo servizio");
      }
      if (coupon.validity.getTime() < Date.now()) {
        return handleError(res, "Coupon scaduto");
      }
      if (_.includes(user.usedCoupons, coupon.text)) {
        return handleError(res, "Coupon già utilizzato");
      }

      res.status(200).json(_.pick(coupon, ['_id', 'text', 'amount', 'numberOfBillingCycles', 'neverExpires']));
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

exports.create = function(req, res) {
  if (!req.body.validity || new Date(req.body.validity).getTime() <= Date.now()) {
    return res.status(400).send("Data di scadenza non valida");
  }
  if (!req.body.amount) {
    return res.status(400).send("Ammontare di sconto non specificato");
  }
  if (!req.body.service || !config.services[req.body.service]) {
    return res.status(400).send("Il servizio specificato è inesatto");
  }
  
  Coupon.find({}, {text: true}, function(err, coupons) {
    Coupon.create(_.merge(req.body, {text: generateCouponCode({
      maxLength: 8,
      minLength: 8,
      match: /^[A-Z0-9]*$/,
      unique: coupons.map(coupon => coupon.text)
    }), inheritedFromId: config.braintree.discountTemplate}), function(err, coupon) {
      if (err) {
        return handleError(res, err);
      }
      
      res.status(201).json(coupon);
    });
  });
};

exports.edit = function(req, res) {
  Coupon.findByIdAndUpdate(req.params.id, req.body, {new: true}, function(err, coupon) {
      if (err || !coupon) {
        return handleError(res, err);
      }
      
      res.status(200).json(coupon);
  });
};

exports.remove = function(req, res) {
  Coupon.findByIdAndUpdate(req.params.id, {enabled: false}, function(err, coupon) {
      if (err || !coupon) {
        return handleError(res, err);
      }
      
      res.status(204).end();
  });
}

function handleError(res, err) {
  return res.status(500).send(err);
}

function generateCouponCode(options) {
  const maxLength = options.maxLength || 8,
        minLength = options.minLength || 8;
  let password = "",
      randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
      
  function __unique(password) {
    if (!options.unique || !_.isArray(options.unique)) {
      return false;
    }
    return _.includes(options.unique, password);
  }
  
  do {
    password = generator(randomLength, false, options.match || /[\w\d\?\-]/);
  } while (__unique(password))
  
  return password;
}