'use strict';

const ADMITTED_COLLECTIONS = new Set(["articles","users"]),
      ADMITTED_MIME_TYPES = new Set([
        'image/jpg',
        'image/jpeg',
        'image/png',
        'image/gif'
      ]),

      request = require('request'),
      _ = require('lodash'),
      User = require('../../user/user.model'),
      Article = require('../../article/article.model'),
      Picture = require('../../picture/picture.model'),
      lwip = require('lwip'),
      co = require('co');

exports.index = function(req, res) {
  co(function*() {
    let _picture_found, _picture, _property, _mime, _formatOut, _base64,
        _pictureOpened, _pictureResized, _pictureB64, _response;

    if (!ADMITTED_COLLECTIONS.has(req.params.collection)) {
      return res.status(400).send("Invalid collection requested");
    }
    try {
      switch (req.params.collection) {
        case 'articles':
          _picture = yield Article.findById(req.params.assetId, {'thumbnail': 1});
          _property = 'thumbnail';
          break;
        case 'users':
          _picture = yield User.findById(req.params.assetId, {'picture': 1});
          _property = 'picture';
          if(_picture[_property] && !_.isEmpty(_picture[_property]) && _picture[_property] != '' && !_picture[_property].includes('data:')) {
            _picture_found = yield Picture.findOne({name:_picture[_property]},'picture');
            _picture[_property] = _picture_found.picture;
          }
          break;
      }
      if (!_picture[_property] || _.isEmpty(_picture[_property])) {
        return res.status(400).send("Item does not have an asset");
      }
      if (req.query.width && req.query.height) {
        if (_picture[_property].includes('data:')) {
          _mime = _picture[_property].substring(5, _picture[_property].indexOf(';'));
          // exit if asset is not an image
          if (!ADMITTED_MIME_TYPES.has(_mime)) {
            return res.status(400).send("Asset is not an image");
          }
          _base64 = _picture[_property].substring(_picture[_property].indexOf('base64,') + 7);
          _pictureOpened = yield new Promise(function(resolve, reject) {
            lwip.open(new Buffer(_base64, 'base64'), _mime.split('/')[1], function(err, image) {
              if (err) {
                return reject(err);
              }

              return resolve(image);
            });
          });
        }
        else if (_picture[_property].includes("http://") || _picture[_property].includes("https://")) {
          _pictureOpened = yield new Promise(function(resolve, reject) {
            request.get({
              url: _picture[_property],
              encoding: null
            }, function(err, pictureResponse, pictureData) {
              if (err) {
                return reject(err);
              }
              _mime = pictureResponse.headers['content-type'];
              // exit if asset is not an image
              if (!ADMITTED_MIME_TYPES.has(_mime)) {
                return res.status(400).send("Asset is not an image");
              }
              lwip.open(pictureData, _mime.split('/')[1], function(err, image) {
                if (err) {
                  return reject(err);
                }

                return resolve(image);
              });
            });
          });
        }

        _pictureResized = yield new Promise(function(resolve, reject) {
          switch (req.query.method) {
            case 'resize':
              _pictureOpened.resize(parseInt(req.query.width, 10), parseInt(req.query.height, 10), 'lanczos', function(err, image) {
                if (err) {
                  return reject(err);
                }

                return resolve(image);
              });
              break;
            case 'contain':
              _pictureOpened.contain(parseInt(req.query.width, 10), parseInt(req.query.height, 10), [255, 255, 255, 0], 'lanczos', function(err, image) {
                if (err) {
                  return reject(err);
                }

                return resolve(image);
              });
              break;
            case 'cover':
              _pictureOpened.cover(parseInt(req.query.width, 10), parseInt(req.query.height, 10), 'lanczos', function(err, image) {
                if (err) {
                  return reject(err);
                }

                return resolve(image);
              });
              break;
            default:
              _pictureOpened.contain(parseInt(req.query.width, 10), parseInt(req.query.height, 10), [255, 255, 255, 0], 'lanczos', function(err, image) {
                if (err) {
                  return reject(err);
                }

                return resolve(image);
              });
          }
        });

        switch (_mime.split('/')[1]) {
          case 'jpeg':
          case 'jpg':
            _formatOut = 'jpg';
            break;
          case 'png':
            _formatOut = 'png';
            break;
          case 'gif':
            _formatOut = 'gif';
            break;
          default:
            _formatOut = 'jpg';
        }
        _pictureB64 = yield new Promise(function(resolve, reject) {
          _pictureResized.toBuffer(_formatOut, function(err, buffer) {
            if (err) {
              return reject(err);
            }

            return resolve(buffer);
          });
        });

        _response = "data:image/" + _formatOut + ";base64," + _pictureB64.toString('base64');
      }
      else {
        _response = _picture[_property];
      }

      return res.status(200).type('text').send(_response);
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
