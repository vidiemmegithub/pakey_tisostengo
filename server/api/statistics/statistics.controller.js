'use strict';

const User = require('../user/user.model'),
      Question = require('../question/question.model'),
      Article = require('../article/article.model'),
      Message = require('../message/message.model'),
      co = require('co');

// Gets all Statisticss
exports.index = function(req, res) {
  co(function*() {
    let _statistics = {};

    try {
    	_statistics.user = {};
      _statistics.user.qualifiedApproved = yield User.count({'role': 'qualified', 
                                                             'banned': {'$not': {'$eq': true}}, 
                                                             '$or': [{'enablingToken': null}, {'enablingToken': ''}] });
      _statistics.user.qualifiedNotApproved = yield User.count({'role': 'unqualified', 
                                                                'registrationPending': true, 
                                                                'banned': {'$not': {'$eq': true}},
                                                                '$or': [{'enablingToken': null}, {'enablingToken': ''}] });
      _statistics.user.unqualified = yield User.count({'role': 'unqualified', 
                                                       'registrationPending': false, 
                                                       'banned': {'$not': {'$eq': true}},
                                                       '$or': [{'enablingToken': null}, {'enablingToken': ''}] });
      _statistics.user.editor = yield User.count({'role': 'editor', 
                                                  'banned': {'$not': {'$eq': true}},
                                                  '$or': [{'enablingToken': null}, {'enablingToken': ''}] });

      _statistics.article = {};
      _statistics.article.qualified = yield Article.count({'editorial': false});
      _statistics.article.editorial = yield Article.count({'editorial': true});

      _statistics.question = {};
      _statistics.question.answered = yield Question.count({'answer': {'$not': {'$eq': null}} });
      _statistics.question.notAnswered = yield Question.count({'answer': {'$eq': null } });

      _statistics.message = {};
      _statistics.message.pendingInformation = yield Message.count({status: 'pending', type: 'information' });
      _statistics.message.pendingTechnical = yield Message.count({status: 'pending', type: 'technical' });
      _statistics.message.pendingAbuse = yield Message.count({status: 'pending', type: 'abuse' });
      
      return res.status(200).json({
        statistics: _statistics
      });
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
