'use strict';

const config = require('../../config/environment'),
      Message = require('./message.model'),
      nodemailer = require('nodemailer'),
      transport = nodemailer.createTransport(config.email),
      co = require('co');

// Get list of articles
exports.index = function (req, res) {
  co(function*() {
    let _messages;

    try {
      _messages = yield Message.find(req.filter, {}, { limit: req.paging.limit, skip: req.paging.skip, sort: {'pub_date': -1} });

      return res.status(200).json({ 'messages': _messages });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

exports.create = function (req, res) {
  co(function*() {
    let _message, _typeString;

    try {
      _message = new Message(req.body);
      yield _message.save();
    }
    catch(err) {
      return validationError(res, err);
    }

    switch (_message.type) {
      case 'abuse':
        _typeString = "Segnala un abuso";
        break;
      case 'information':
        _typeString = "Richiedi informazioni";
        break;
      case 'technical':
        _typeString = "Richiedi assistenza tecnica";
        break;
    }
    try {
      if ('production' === process.env.NODE_ENV || 'test' === process.env.NODE_ENV || 'heroku-dev' === process.env.NODE_ENV) {
        yield new Promise((resolve, reject) => {
          transport.sendMail({
            from: config.email.registrationEmailSender,
            to: config.email.messagesEmailReceip,
            subject: 'Nuovo messaggio da TiSOStengo',
            text: `
Tipo di contatto: ${_typeString}
Mittente: ${_message.firstname} ${_message.lastname}
Email: ${_message.email}
Testo del messaggio: ${_message.text}
Pagina segnalata: ${(_message.url) ? _message.url : ''}
            `
          }, err => {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        });
      }

      return res.status(204).end();
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

exports.resolve = function (req, res) {
  Message.findByIdAndUpdate(req.params.id, {'$set': {status: 'resolved'}}, function(err) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(204).end();
  });
};


function handleError(res, err) {
  console.error(err);
  return res.status(500).send(err);
}
function validationError(res, err) {
  //console.log(err);
  if (err.name && err.name === 'ValidationError') {
    // strip only first mongoose erros (if more than one)
    return res.status(422).json({message: err.errors[Object.keys(err.errors)[0]].message});
  }
  return res.status(422).json({message: err.message});
}
