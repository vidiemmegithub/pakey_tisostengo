'use strict';

const mongoose = require('mongoose'),
      User = require('../user/user.model'),
      async = require('async');


let CarepathStepSchema = new mongoose.Schema({
  title: String,
  description: { type: String, max: 500 },
  specialists: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' },
  specializations: [String],
  question: {
    type: {
      text: String
    },
    required: false
  }
});

let CarepathSchema = new mongoose.Schema({
  title: { type: String, unique: true, index: 'text' },
  description: { type: String, max: 500, index: 'text' },
  tags: { type: [String], required: true, index: 'text' },
  steps: {
    type: [CarepathStepSchema],
    required: true
  },
  created_at: { type: Date, default: Date.now, immutable: true }
});

CarepathSchema.index( {"title": "text", "description": "text", tags: "text"}, {"weights": { title: 3, tags: 2, description: 1 } }, { default_language: "italian" } );

CarepathSchema.pre('save', function (next) {
  var steps = this.steps;
  validateSteps(steps, function(res){
    //if (res) {
      console.log(res);
      //validateSpecialists(steps, function(res){
        if(res) return next(); else return next(new Error());
      //});
    // } else {
    //   return next(new Error());
    // }
  });
});

function validateSteps(steps, res) {
  var isValid = true;
  for(var i=0;i<steps.length;i++) {
    if (typeof steps[i].question !== 'undefined') {
      var q1 = steps[i].question.text.trim();
      for(var j=0;j<steps.length;j++) {
        if (typeof steps[j].question !== 'undefined') {
          var q2 = steps[j].question.text.trim();
          if(i!=j && q1 === q2 && q1.length !== 0) {
            isValid = false;
          }
        }
      }
    }
  }
  res(isValid);
}

function validateSpecialists(steps, res) {
  async.waterfall([
    function(cb){
      var fs = [];
      steps.forEach(function(step, index, array){
        step.specializations = [];
        step.specialists.forEach(function(id, index, array){
          fs.push(function(cb){
            User.findOne({'_id': id, 'role':'qualified'}, '_id title firstname lastname role specialization', function(err, user) {
              if(typeof user === 'undefined' || user === null || err) {
                cb(new Error());
              } else {
                if(step.specializations.length == 0) {
                  step.specializations.push(user.specialization.toString());
                  cb();
                } else {
                  var newSpecs = [];
                  step.specializations.forEach(function(spec, index, array){
                    if(user.specialization.toString() != spec)
                      newSpecs.push(user.specialization.toString());
                  });
                  if(newSpecs.length > 0)
                    step.specializations.push(newSpecs);
                  cb();
                }
              }
            });
          });
        });
        if(index==array.length-1){
          cb(null, fs);
        }
      });
    },
    function(fs, cb){;
      async.waterfall(fs, cb);
    }
  ], function (err) {
    if (err) {
      res(false);
    }
    else {
      res(true);
    }
  });
}

module.exports = mongoose.model('Carepath', CarepathSchema);
