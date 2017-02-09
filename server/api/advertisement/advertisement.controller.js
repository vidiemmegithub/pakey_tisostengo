'use strict';

const co = require('co'),
      Advertisement = require('./advertisement.model');

// return the next advertisement
exports.show = function (req, res) {
  var now = new Date();

  co(function*() {
    try {
      let visibility = (!req.user) ? 'home' : req.user && req.user.role,
          adv = yield Advertisement.aggregate()
            .project({
              lastView: true,
              picture: true,
              link: true,
              visibility: true,
              validSince: true,
              validUntil: true,
              hoursSince:{$hour:'$validSince'},
              hoursUntil:{$hour:'$validUntil'},
              is24h: {$subtract:[{$hour:'$validUntil'}, {$hour:'$validSince'}]}
            })
            .match({
              visibility: visibility,
              $or:[
                {
                  hoursSince:{$lte: now.getHours()},
                  hoursUntil:{$gte: now.getHours()}
                },
                {
                  is24h:{$lte: 0},
                  hoursSince:{$lte: now.getHours()}
                },
                {
                  is24h:{$lte: 0},
                  hoursUntil:{$gte: now.getHours()}
                }
              ]
            })
            .sort({lastView: 1})
            .limit(1)
            .exec();

      //console.log(adv);
      if(adv.length > 0) {
        yield Advertisement.findByIdAndUpdate(adv[0]._id, { $inc: { views: 1 }, lastView: now });
        res.status(200).json({picture: adv[0].picture, link: adv[0].link});
      }
      else {
        res.status(204).end();
      }

    }
    catch (err) {
      return handleError(res, err);
    }
  });
};

// Gets a list of Advertisements
exports.list = function index(req, res) {
  co(function*() {
    try {
      res.send({ advertisements: yield Advertisement.find() });
    } catch (err) {
      return handleError(res, err);
    }
  });
};

exports.create = function (req, res) {
  co(function*() {
    try {
      return res.status(201).send(yield Advertisement.create(req.body));
    } catch (err) {
      return handleError(res, err);
    }
  });
};

exports.update = function (req, res) {
  co(function*() {
    try {
      yield Advertisement.findOneAndUpdate({ _id: req.params.id }, req.body);
      res.sendStatus(200);
    } catch (err) {
      return handleError(res, err);
    }
  });
};

exports.enable = function (req, res) {
  co(function*() {
    try {
      yield Advertisement.update({ _id: req.params.id }, { $set: { disabled: false } });
      res.sendStatus(200);
    } catch (err) {
      return handleError(res, err);
    }
  });
};

exports.disable = function (req, res) {
  co(function*() {
    try {
      yield Advertisement.update({ _id: req.params.id }, { $set: { disabled: true } });
      res.sendStatus(200);
    } catch (err) {
      return handleError(res, err);
    }
  });
};

exports.remove = function (req, res) {
  co(function*() {
    try {
      yield Advertisement.remove({ _id: req.params.id });
      res.sendStatus(200);
    } catch (err) {
      return handleError(res, err);
    }
  });
};


function handleError(res, err) {
  console.error(err);
  return res.status(500).send(err);
}
