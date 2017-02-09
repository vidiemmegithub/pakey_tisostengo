'use strict';

const config = require('../config/environment'),
      jwt = require('jsonwebtoken'),
      compose = require('composable-middleware'),
      expressJwt = require('express-jwt'),
      _ = require('lodash');

/**
 * Chec that the request contains authorization data
 */
function ensureLogged(req, res, next) {
  if ((!req.headers.authorization || !req.headers.authorization.includes('Bearer')) && !req.query.access_token) {
    return res.status(403).send('Forbidden');
  }
  next();
}

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 401
 */
function isAuthenticated(req, res, next) {
  authenticate(true, req, res, next);
}

function tryAuthenticate(req, res, next) {
  authenticate(false, req, res, next);
}

function authenticate(requireCredentials, req, res, next) {
  let validateJwt = expressJwt({
    secret: config.secrets.session,
    credentialsRequired: requireCredentials
  });

  // allow access_token to be passed through query parameter as well
  if (req.query && req.query.hasOwnProperty('access_token')) {
    req.headers.authorization = 'Bearer ' + req.query.access_token;
  }

  if (req.headers.hasOwnProperty('authorization') && req.headers.authorization.includes('Bearer')) {
    // Validate jwt
    validateJwt(req, res, next);
  }
  else {
    next();
  }
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  if (!_.isArray(roleRequired)) {
    roleRequired = [roleRequired];
  }

  return compose()
    .use(isAuthenticated)
    .use(function meetsRequirements(req, res, next) {
      if (!req.user) {
        return res.status(403).send('Forbidden');
      }

      if (_.intersection(config.userRoles, roleRequired, [req.user.role]).length <= 0) {
        return res.status(403).send('Forbidden');
      }
      else {
        next();
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id, role, expiresIn) {
  return jwt.sign({ _id: id, role: role }, config.secrets.session, { expiresIn: expiresIn || 24 * 60 * 60 });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) {
    return res.status(404).json({ message: 'Something went wrong, please try again.' });
  }
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', token);
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
exports.tryAuthenticate = tryAuthenticate;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
exports.ensureLogged = ensureLogged;
