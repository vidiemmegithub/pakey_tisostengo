'use strict';

const _ = require('lodash'),
      config = require('../../config/environment'),
      fs = require('fs'),
      AWS = require('aws-sdk'),
      s3bucket = new AWS.S3({
        accessKeyId: config.aws.accessKeyId,
        accessKeySecret: config.aws.secretAccessKey,
        params: {Bucket: config.aws.uploadsBucketName }
      });

// Get list of uploads
exports.index = function(req, res) {
  s3bucket.listObjects(function(err, data) {
    if (err) {
      return handleError(res, err);
    }
    res.send(data);
  });
};

// Creates a new upload in the DB.
exports.create = function(req, res) {
  var file = req.files.file;

  if (_.isEmpty(file)) {
    return res.sendStatus(400);
  }
  s3bucket.upload({
      Key: `${req.params.collection}/${Date.now()}_${file.originalFilename}`,
      Body: fs.createReadStream(file.path),
      ContentType: file.type,
      ACL: 'public-read'
    }, function(err, awsResponse) {
      if(err) {
        return handleError(res, err);
      }

      res.send({ name: file.name, location: awsResponse.Location });
    });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
