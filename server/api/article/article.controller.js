'use strict';

const _ = require('lodash'),
      url = require('url'),
      config = require('../../config/environment'),
      User = require('../user/user.model'),
      Article = require('./article.model'),
      striptags = require('striptags'),
      co = require('co'),
      AWS = require('aws-sdk'),
      s3bucket = new AWS.S3({
        accessKeyId: config.aws.accessKeyId,
        accessKeySecret: config.aws.secretAccessKey,
        params: {Bucket: config.aws.uploadsBucketName }
      });

// Get list of articles
exports.index = function (req, res) {
  co(function*() {
    let _articles;

    if (Object.keys(req.fields).length === 0) {
      req.fields = { thumbnail: false };
    }

    try {
      _articles = yield Article
        .find(_.merge(req.filter, {pub_date: {'$not': {'$eq': null}}}), req.fields, { limit: req.paging.limit, skip: req.paging.skip, sort: req.sort })
        .populate({path: 'author', select: 'firstname lastname title', match: {'$or': [{'$or': [{banned: false}, {banned: null}]}, {role: 'editor'}]}});

      // remove articles of banned user
      _.remove(_articles, article => !article.author);

      // strip unwanted tags from article message
      if (!req.user) {
        _articles.forEach(article => { article.text = striptags(_.truncate(article.text, { length: 300 })); });
      }
      else {
        _articles.forEach(article => { article.text = striptags(article.text); });
      }
      return res.status(200).json({ 'articles': _articles });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

exports.indexMe = function (req, res) {
  co(function*() {
    let _articles;

    if (Object.keys(req.fields).length === 0) {
      req.fields = { thumbnail: false };
    }

    try {
      _articles = yield Article
        .find(_.merge({author:req.user._id}, req.filter), req.fields, { limit: req.paging.limit, skip: req.paging.skip, sort: req.sort })
        .populate({path: 'author', select: 'firstname lastname title'});

      _articles.forEach(article => { article.text = striptags(article.text); });
      return res.status(200).json({ 'articles': _articles });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};


// Get list of all articles
exports.indexAll = function (req, res) {
  co(function*() {
    let _articles;

    if (Object.keys(req.fields).length === 0) {
      req.fields = { thumbnail: false };
    }

    try {
      _articles = yield Article
        .find(req.filter, req.fields, { limit: req.paging.limit, skip: req.paging.skip, sort: req.sort })
        .populate({path: 'author', select: 'firstname lastname title'});

      // strip unwanted tags from article message
      _articles.forEach(article => { article.text = striptags(article.text); });
      return res.status(200).json({ 'articles': _articles });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Get list of first articles written by the requester followed users
exports.indexFollowed = function (req, res) {
  co(function*() {
    let _user, _articles, _articlesObj;

    try {
      _user = yield User.findById(req.user._id, {'followed': true});
      _articles = yield Article.aggregate()
        .match(_.merge(req.filter, {'author': {'$in': _user.followed}}))
        .sort({'pub_date': -1})
        .skip(req.paging.skip)
        .limit(req.paging.limit)
        .group({_id: '$author', 'recent': {'$first': '$$ROOT'}})
        .exec();

      _articlesObj = _articles.map(article => {
        delete article.recent.thumbnail;
        delete article.recent.comments;
        delete article.recent.text;
        delete article.recent.category;
        delete article.recent.evidence_unq;
        delete article.recent.evidence_uq;
        delete article.recent.evidence;
        delete article.recent.editorial;
        delete article.recent.priority;
        delete article.recent.tags;
        delete article.recent.__v;
        return article.recent;
      });
      _articlesObj.sort((a,b) => b.pub_date.getTime()-a.pub_date.getTime());
      return res.status(200).json({ 'articles': yield User.populate(_articlesObj, {path: 'author', select: 'firstname lastname title'}) });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Get list of first articles written by the requester followed users
exports.indexFollowedAll = function (req, res) {
  co(function*() {
    let _user, _articles;

    if (Object.keys(req.fields).length === 0) {
      req.fields = { thumbnail: false };
    }

   try {
      _user = yield User.findById(req.user._id, {'followed': true});
      _articles = yield Article
        .find(_.merge(req.filter, {'author': {'$in': _user.followed}}), req.fields, { limit: req.paging.limit, skip: req.paging.skip, sort: {'pub_date': -1}})
        .populate('author', 'firstname lastname title');

      return res.status(200).json({ 'articles': _articles });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Get list of first articles written by the most followed users
exports.indexMostFollowed = function (req, res) {
  co(function*() {
    let _users, _articles, _articlesObj;

    try {
      _users = yield User.aggregate()
        .match({'$or': [{banned: false}, {banned: null}]})
        .unwind('followed')
        .group({_id: '$followed', count : { $sum : 1 }})
        .sort({'count': -1})
        .limit(30)
        .exec();

      _articles = yield Article.aggregate()
        .match(_.merge(req.filter, {'author': {'$in': _users.map(user => user._id) }}))
        .sort({'pub_date': -1})
        .group({_id: '$author', 'recent': {'$first': '$$ROOT'}})
        .exec();

      // order users first by the count property then by the injected pub_date of his first article
      _users.forEach(user => {
        let _article = _articles.find(article => article._id.equals(user._id));

        if (_article) {
          user.pub_date = _article.recent.pub_date;
        }
      });
      _users.sort((a, b) => {
        if(a.count===b.count && b.pub_date && a.pub_date) {
          return (new Date(b.pub_date)).getTime()-(new Date(a.pub_date)).getTime();
        }
        else {
          return b.count-a.count;
        }
      });

      // remap articles in usual structure and order them by their author order in users ordered collection
      _articlesObj = _.sortBy(
        _articles.map(article => {
          delete article.recent.thumbnail;
          delete article.recent.comments;
          delete article.recent.text;
          delete article.recent.category;
          delete article.recent.evidence_unq;
          delete article.recent.evidence_uq;
          delete article.recent.evidence;
          delete article.recent.editorial;
          delete article.recent.priority;
          delete article.recent.tags;
          delete article.recent.__v;
          return article.recent;
        }),
        article => _.findIndex(_users, user => user._id.equals(article.author)));

      // populate only non banned authors
      yield User.populate(_articlesObj, {
        path: 'author',
        select: 'firstname lastname title banned',
        match: {'$or': [{'$or': [{banned: false}, {banned: null}]}, {role: 'editor'}]}
      });
      // remove articles of banned users
      _.remove(_articlesObj, article => !article.author);

      return res.status(200).json({
        articles: _articlesObj
      });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Get a single article
exports.show = function (req, res) {
  co(function*() {
    let _article;

    if (Object.keys(req.fields).length === 0) {
      req.fields = { thumbnail: false };
    }

    try {
      _article = yield Article.findById(req.params.id, req.fields);

      if (!req.user && !_article.editorial) {
        _article.text = _.truncate(_article.text, { length: 300 });
      }

      if (!req.user) {
        yield User.populate(_article, {
          path: 'author',
          select: 'title firstname lastname bio specialization city subscriptions role',
          match: {'$or': [{'$or': [{banned: false}, {banned: null}]}, {role: 'editor'}]}
        });
      }
      else {
        yield User.populate(_article, {
          path: 'author comments.author',
          select: 'title firstname lastname bio specialization city subscriptions role',
          match: {'$or': [{'$or': [{banned: false}, {banned: null}]}, {role: 'editor'}]}
        });

        // remove banned user comments
        _.remove(_article.comments, comment => !comment.author);
      }

      // exit if article author is a banned user
      if (!_article.author) {
        return res.status(403).end();
      }

      return res.status(200).json(_article);
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

// Creates a new article in the DB.
exports.create = function (req, res) {
  req.body.author = req.user;
  req.body.editorial = 'editor' === req.user.role;

  if(req.user.role === 'qualified') {
    req.body.pub_date = new Date();
  }

  Article.create(req.body, function (err, article) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(201).json(article);
  });
};

// Updates an existing article in the DB.
exports.update = function (req, res) {
  let _article, _updated;

  if (req.body._id) {
    delete req.body._id;
  }
  co(function*() {
    try {
      _article = yield Article.findById(req.params.id, {'comments': false});
      if (!_article) {
        return res.status(404).send('Article not Found');
      }
      // check if the requested can edit article
      if (!req.user.role.includes('admin') && req.user._id.toString() !== _article.author.toString()) {
        return res.status(401).send('User not authorized to edit this article');
      }

      // remove asset image if we're going to change it
      if (req.body.hasOwnProperty('thumbnail') && !_.isEmpty(_article.thumbnail) && req.body.thumbnail !== _article.thumbnail) {
        if (_article.thumbnail.includes('http')) {
          yield new Promise((resolve, reject) => {
            s3bucket.deleteObject({
              Key: _.takeRight(url.parse(_article.thumbnail).pathname.split('/'), 2).join('/')
            }, function(err) {
              if (err) {
                reject(err);
              }
              else {
                resolve();
              }
            })
          });
        }
      }

      _updated = _.merge(_article, req.body);
      Object.keys(req.body).forEach(prop => _updated.markModified(prop));
      _updated.markModified('pub_date');
      yield _updated.save();

      return res.status(200).json(_updated);
    }
    catch(e) {
      return handleError(res, e);
    }
  });
};

// Deletes a article from the DB.
exports.destroy = function (req, res) {
  let _article;

  co(function*() {
    try {
      _article = yield Article.findById(req.params.id);
      if (!_article) {
        return res.status(404).send('Article not Found');
      }
      // check if the requested can destroy article
      if (!req.user.role.includes('admin') && req.user._id.toString() !== _article.author.toString()) {
        return res.status(401).send('User not authorized to remove this article');
      }
      // remove attached image
      if (_article.thumbnail && !_.isEmpty(_article.thumbnail) && _article.thumbnail.includes('http')) {
        yield new Promise((resolve, reject) => {
          s3bucket.deleteObject({
            Key: _.takeRight(url.parse(_article.thumbnail).pathname.split('/'), 2).join('/')
          }, function(err) {
            if (err) {
              reject(err);
            }
            else {
              resolve();
            }
          })
        });
      }
      yield _article.remove();

      return res.status(204).end();
    }
    catch(e) {
      return handleError(res, e);
    }
  });
};

exports.addComment = function (req, res) {
  co(function*() {
    try {
      var article = yield Article.findById(req.params.id);

      article.comments.push({
        text: req.body.text,
        author: req.user
      });

      article.markModified('comments');
      yield article.save();

      res.sendStatus(201);
    } catch (err) {
      handleError(res, err);
    }
  });
};

exports.publish = function (req, res) {
  co(function*() {
    try {
      var article = yield Article.findById(req.params.id);
      article.pub_date = Date.now();

      article.markModified('pub_date');
      yield article.save();

      res.sendStatus(200);
    } catch (err) {
      handleError(res, err);
    }
  });
};

exports.unpublish = function (req, res) {
  co(function*() {
    try {
      var article = yield Article.findById(req.params.id);
      article.pub_date = null;

      article.markModified('pub_date');
      yield article.save();

      res.sendStatus(200);
    } catch (err) {
      handleError(res, err);
    }
  });
};

exports.share = function (req, res) {
  co(function*() {
    let _article, _html;

    try {
      _article = yield Article
        .findById(req.params.id, { title: true, text: true, thumbnail: true, pub_date: true });
        //.populate('author', 'firstname lastname title');

      if (!_article) {
        return res.status(400).end();
      }
      _html = [
        '<html>',
            '<head>',
              '<meta property="fb:app_id" content="' + config.facebook.clientID + '">',
              //'<meta property="og:url" content="' + req.protocol + '://' + req.hostname + req.baseUrl + '">',
              '<meta property="og:url" content="' + config.domain + req.baseUrl + '">',
              '<meta property="og:site_name" content="TiSOStengo">',
              '<meta property="og:type" content="article">',
              '<meta property="og:title" content="' + htmlEncode(_article.title) + '">',
              '<meta property="og:description" content="' + striptags(_article.text) + '">',
              '<meta property="og:locale" content="it_IT">',
              '<meta property="og:determiner" content="an">',
              '<meta property="og:updated_time" content="' + _article.pub_date.toISOString() + '">',
              '<meta property="og:image" content="' + _article.thumbnail + '">',
              '<meta property="og:image:secure_url" content="' + _article.thumbnail + '">',
            '</head>',
        '</html>'
        ].join("");
      return res.status(200).type('text/html').send(_html);
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

function htmlEncode(str) {
  return str.replace(/[\u00A0-\u9999<>\W_]/gim, function(i) {
    return '&#'+i.charCodeAt(0)+';';
  });
}

function handleError(res, err) {
  console.error(err);
  return res.status(500).send(err);
}
