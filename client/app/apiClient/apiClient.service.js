'use strict';

angular.module('tisostengoApp')
  .service('apiClient', function ($http, apiBaseUrl) {
    return {
      articles: {
        list: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/articles', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields),
              s: 'pub_date'
            }
          });
        },
        me: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/articles/me', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields),
              s: 'pub_date'
            }
          });
        },
        all: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/articles/all', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields),
              s: 'pub_date'
            }
          });
        },
        listFollowed: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/articles/followed', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        listAllFollowed: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/articles/followed/all', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        listMostFollowed: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/articles/mostfollowed', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        get: function (id, query, fields) {
          return $http.get(apiBaseUrl + '/articles/' + id, {
            params: {
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        addComment: function (articleId, comment) {
          return $http.post(apiBaseUrl + '/comments/articles/' + articleId, { text: comment });
        },
        removeComment: function (commentId) {
          return $http.delete(apiBaseUrl + '/comments/' + commentId);
        },
        create: function (article) {
          return $http.post(apiBaseUrl + '/articles', article);
        },
        update: function (article) {
          return $http.put(apiBaseUrl + '/articles/' + article._id, article);
        },
        delete: function (articleId) {
          return $http.delete(apiBaseUrl + '/articles/' + articleId);
        },
        publish: function (articleId) {
          return $http.put(apiBaseUrl + '/articles/' + articleId + '/publish');
        },
        unpublish: function (articleId) {
          return $http.delete(apiBaseUrl + '/articles/' + articleId + '/publish');
        }
      },
      users: {
        list: function (query, fields, perPage, page, keysearch) {
          return $http.get(apiBaseUrl + '/users', {
            params: {
              keysearch: keysearch,
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields),
            }
          });
        },
        all: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/users/all', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        specialists: function (specializations) {
          return $http.post(apiBaseUrl + '/users/specialists', {
            params: {
              specializations: specializations
            }
          });
        },
        get: function (id, statistics, query, fields) {
          return $http.get(apiBaseUrl + '/users/' + id, {
            params: {
              statistics: statistics,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        me: function (statistics, query, fields) {
          return $http({
            url: apiBaseUrl + '/users/me',
            method: 'GET',
            params: {
              statistics: statistics,
              q: makeQuery(query),
              f: makeField(fields)
            },
            transformResponse: appendTransform($http.defaults.transformResponse, function (value) {
              if (value.dateOfBirth) {
                value.dateOfBirth = new Date(value.dateOfBirth);
              }
              return value;
            })
          });
        },
        listFollowed: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/users/me/followed', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        listUserFollowed: function (id, query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/users/' + id + '/followed', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        addFollowed: function (data) {
          return $http.put(apiBaseUrl + '/users/me/followed', data);
        },
        removeFollowed: function (data) {
          return $http.put(apiBaseUrl + '/users/me/removefollowed', data);
        },
        listMostFollowed: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/users/followed', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        listRequested: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/users/requested', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        updateMe: function (data) {
          return $http.put(apiBaseUrl + '/users/me', data);
        },
        update: function (data) {
          return $http.put(apiBaseUrl + '/users/' + data._id, data);
        },
        resetPassword: function (email, province) {
          return $http.get(apiBaseUrl + '/users/resetPassword', {
            params: {
              email: email,
              province: province
            }
          });
        },
        validateRegistration: function (data) {
          return $http.put(apiBaseUrl + '/users/' + data._id + '/validateRegistration', data);
        },
        ban: function (userId) {
          return $http.get(apiBaseUrl + '/users/' + userId + '/ban', {
            params: {
              active: true,
            }
          });
        },
        removeBan: function (userId) {
          return $http.get(apiBaseUrl + '/users/' + userId + '/ban', {
            params: {
              active: false,
            }
          });
        },
        delete: function (userId) {
          return $http.delete(apiBaseUrl + '/users/' + userId);
        },
        import: function(users) {
          return $http.post(apiBaseUrl + '/users/import', {
            timeout: 3000000,
            params: {
              users: users
            }
          })
        }
      },
      questions: {
        list: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/questions', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields),
              s: 'pub_date'
            }
          });
        },
        all: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/questions/all', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields),
              s: 'pub_date'
            }
          });
        },
        get: function (id, query, fields) {
          return $http.get(apiBaseUrl + '/questions/' + id, {
            params: {
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        listFollowed: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/questions/followed', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        listMostFollowed: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/questions/mostfollowed', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        incoming: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/questions/me/incoming', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        outgoing: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/questions/me/outgoing', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        addComment: function (questionId, comment) {
          return $http.post(apiBaseUrl + '/comments/questions/' + questionId, { text: comment });
        },
        removeComment: function (commentId) {
          return $http.delete(apiBaseUrl + '/comments/' + commentId);
        },
        create: function (question) {
          return $http.post(apiBaseUrl + '/questions', question);
        },
        answer: function (id, answer) {
          return $http.post(apiBaseUrl + '/questions/' + id + '/answer', answer);
        },
        delete: function (questionId) {
          return $http.delete(apiBaseUrl + '/questions/' + questionId);
        },
      },
      tags: {
        list: function (perPage, page) {
          return $http.get(apiBaseUrl + '/tags', {
            params: {
              per_page: perPage,
              page: page,
            }
          });
        },
        user: function (id, perPage, page) {
          return $http.get(apiBaseUrl + '/tags/' + id, {
            params: {
              per_page: perPage,
              page: page,
            }
          });
        }
      },
      comments: {
        get: function (perPage, page) {
          return $http.get(apiBaseUrl + '/comments', {
            params: {
              per_page: perPage,
              page: page,
            }
          });
        },
        getArticles: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/comments/articles', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        },
        getQuestions: function (query, fields, perPage, page) {
          return $http.get(apiBaseUrl + '/comments/questions', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query),
              f: makeField(fields)
            }
          });
        }
      },
      search: {
        questions: function (string, query, perPage, page) {
          return $http.post(apiBaseUrl + '/query/content', {string: string}, {
            params: {
              type: 'questions',
              per_page: perPage,
              page: page,
              q: makeQuery(query)
            }
          });
        },
        articles: function (string, query, perPage, page) {
          return $http.post(apiBaseUrl + '/query/content', {string: string}, {
            params: {
              type: 'articles',
              per_page: perPage,
              page: page,
              q: makeQuery(query)
            }
          });
        },
        users: function (string, query, perPage, page) {
          return $http.post(apiBaseUrl + '/query/users', {string: string}, {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query)
            }
          });
        },
        premiumUsers: function (string) {
          return $http.post(apiBaseUrl + '/query/users/premium', { string: string});
        }
      },
      messages: {
        list: function (query, perPage, page) {
          return $http.get(apiBaseUrl + '/messages', {
            params: {
              per_page: perPage,
              page: page,
              q: makeQuery(query)
            }
          });
        },
        create: function (message) {
          return $http.post(apiBaseUrl + '/messages', message);
        },
        resolve: function (messageId) {
          return $http.get(apiBaseUrl + '/messages/' + messageId + '/resolve');
        }
      },
      pictures: {
        get: function(picture) {
          return $http.get(apiBaseUrl + '/pictures/' + picture.name);
        },
        all: function() {
          return $http.get(apiBaseUrl + '/pictures');
        },
        create: function(picture) {
          return $http.post(apiBaseUrl + '/pictures', picture);
        },
        update: function(picture) {
          return $http.put(apiBaseUrl + '/pictures/' + picture.name, picture);
        },
        remove: function(picture) {
          return $http.delete(apiBaseUrl + '/pictures/' + picture.name);
        },
        move: function(){
          return $http.get(apiBaseUrl + '/pictures/manage/move');
        }
      },
      specializations: {
        all: function(keysearch, perPage, page) {
          return $http.get(apiBaseUrl + '/specializations', {
            params: {
              keysearch: keysearch,
              per_page: perPage,
              page: page
            }
          });
        },
        allByCategories: function(item) {
          return $http.get(apiBaseUrl + '/specializations/categories', {
            params: {
              item:item
            }
          });
        },
        byCategory: function(specialization) {
          return $http.get(apiBaseUrl + '/specializations/categories/' + specialization.category);
        },
        create: function(specialization) {
          return $http.post(apiBaseUrl + '/specializations', specialization);
        },
        update: function(specialization) {
          return $http.put(apiBaseUrl + '/specializations/' + specialization.name, specialization);
        },
        remove: function(specialization) {
          return $http.delete(apiBaseUrl + '/specializations/' + specialization.name);
        }
      },
      images: {
        image: function (category, id, width, height, method) {
          return $http.get(apiBaseUrl + '/assets/pictures/' + category + '/' + id, {
            params: {
              width: width,
              height: height,
              method: method
            }
          });
        }
      },
      advertisements: {
        list: function () {
          return $http.get(apiBaseUrl + '/advertisements/admin');
        },
        create: function (data) {
          return $http.post(apiBaseUrl + '/advertisements/admin', data);
        },
        update: function (data) {
          return $http.put(apiBaseUrl + '/advertisements/admin/' + data._id, data);
        },
        enable: function (id) {
          return $http.put(apiBaseUrl + '/advertisements/admin/' + id + '/enable');
        },
        disable: function (id) {
          return $http.delete(apiBaseUrl + '/advertisements/admin/' + id + '/enable');
        },
        remove: function (id) {
          return $http.delete(apiBaseUrl + '/advertisements/admin/' + id);
        },
        showNext: function (home) {
          return $http.get(apiBaseUrl + '/advertisements' + (home ? '?home' : ''));
        }
      },
      statistics: {
        all: function () {
          return $http.get(apiBaseUrl + '/statistics');
        }
      },
      coupons: {
        list: function () {
          return $http.get(apiBaseUrl + '/coupons', {
            params: {
              s: 'createdAt'
            }
          });
        },
        get: function (couponId) {
          return $http.get(apiBaseUrl + '/coupons/' + couponId);
        },
        create: function (coupon) {
          return $http.post(apiBaseUrl + '/coupons',  coupon);
        },
        update: function (couponId, coupon) {
          return $http.put(apiBaseUrl + '/coupons/' + couponId,  coupon);
        },
        delete: function (couponId) {
          return $http.delete(apiBaseUrl + '/coupons/' + couponId);
        },
        verify: function (couponText, serviceType) {
          return $http.get(apiBaseUrl + '/coupons/verify/' + couponText + '/' + serviceType);
        }
      },
      payments: {
        plans: function () {
          return $http.get(apiBaseUrl + '/payments/braintree/plans', { forceLoadingBar: true });
        },
        token: function () {
          return $http.get(apiBaseUrl + '/payments/braintree/token');
        },
        addresses: function () {
          return $http.get(apiBaseUrl + '/payments/braintree/addresses');
        },
        subscribe: function (serviceType, nonce, address, discount) {
          return $http.post(apiBaseUrl + '/payments/braintree/subscription/' + serviceType, {
            payment_method_nonce: nonce,
            billingDetail: address,
            discount: discount && discount.text
          });
        },
        unsubscribe: function (serviceType, userId) {
          return $http.delete(apiBaseUrl + '/payments/braintree/subscription/' + serviceType, {
            params: {
              userId: userId
            }
          });
        }
      },
      carepaths: {
        list: function (filter, perPage, page) {
          return $http.get(apiBaseUrl + '/carepaths', {
            params: {
              filter: filter,
              per_page: perPage,
              page: page
            }
          });
        },
        get: function (id, query, fields) {
          return $http.get(apiBaseUrl + '/carepaths/' + id);
        },
        create: function (carepath) {
          return $http.post(apiBaseUrl + '/carepaths/create', carepath);
        },
        update: function (id, carepath) {
          return $http.post(apiBaseUrl + '/carepaths/' + id + '/update', carepath);
        },
        delete: function (id) {
          return $http.post(apiBaseUrl + '/carepaths/' + id + '/delete');
        }
      }
    };

    function makeQuery(query) {
      if (!query || Object.keys(query).length < 1) return;

      return Object.keys(query)
        .filter(function (key) {
          return !angular.isUndefined(query[key]);
        })
        .map(function (key) {
          if (angular.isArray(query[key])) {
            return key + ':' + query[key].join('|');
          } else {
            return key + ':' + query[key];
          }
        }).join(';');
    }

    function makeField(fields) {
      if (!fields || fields.length < 1) return;

      return fields.join(';');
    }

    function appendTransform(defaults, transform) {

      // We can't guarantee that the default transformation is an array
      defaults = angular.isArray(defaults) ? defaults : [defaults];

      // Append the new transformation to the defaults
      return defaults.concat(transform);
    }
  });
