'use strict';

const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      config = require('../../config/environment');

var CouponSchema = new Schema({
  inheritedFromId: { type: String, required: true, immutable: true }, 
  numberOfBillingCycles: { type: Number, min: 1, immutable: true },
  neverExpires: { type: Boolean, default: false, immutable: true },
  amount: { type: String, required: true, immutable: true },
  text: { type: String, required: true, unique: true, immutable: true },
  service: { type: String, enum: Object.keys(config.services), required: true, immutable: true },
  validity: { type: Date, required: true, immutable: true },
  usedTimes: {type: Number, default: 0, immutable: true },
  enabled: { type: Boolean, default: true },
  createdAt: {type: Date, default: Date.now }
});

/**
 * Methods
 */
CouponSchema.methods = {
  extractDiscountInformation: function() {
    return {
      inheritedFromId: this.inheritedFromId,
      numberOfBillingCycles: this.numberOfBillingCycles,
      amount: this.amount,
      neverExpires: this.neverExpires
    };
  },
  use: function(done) {
    this.usedTimes += 1;
    this.save(done);
  }
};
/**
 * Pre- hooks
 */
CouponSchema
  .pre('save', function (next) {
    if (this.neverExpires) {
      delete this.numberOfBillingCycles;
    }
    else {
      this.numberOfBillingCycles = this.numberOfBillingCycles || 1;
    }
    next();
  });

module.exports = mongoose.model('Coupon', CouponSchema);
