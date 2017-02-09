'use strict';

angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 500);

angular.module('tisostengoApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ui.router',
    'ngAnimate',
    'ui.bootstrap',
    'infinite-scroll',
    'textAngular',
    'ngFileUpload',
    'ezfb',
    'ui.validate',
    'ngMessages',
    'angular-loading-bar',
    'toastr',
    'ui.utils.masks',
    'angularLoad',
    'angularjs-dropdown-multiselect',
    'dndLists'
  ])
  .constant('apiBaseUrl', 'api')
  /* BrainTree client Token Path */
  .constant('clientTokenPath', '/api/payments/braintree/token')

  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.unshift(function () {
      return {
        request: function (config) {
          if (config.method !== 'POST' && !config.forceLoadingBar) {
            config.ignoreLoadingBar = true;
          }

          return config;
        }
      }
    });

    $httpProvider.interceptors.push('authInterceptor');
  })
  .config(function configureFacebook(ezfbProvider) {
    ezfbProvider.setInitParams({
      appId: '1525062534454714',
      version: 'v2.5'
    });
    ezfbProvider.setLocale('it_IT');
  })
  .factory('authInterceptor', function ($rootScope, $q, $cookies) {
    return {
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookies.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookies.get('token');
        }

        return config;
      },

      responseError: function (response) {
        if (response.status === 401) {
          $cookies.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })
  .config(function closeModalsWhenNavigating($provide) {
    $provide.decorator('$uibModal', function ($rootScope, $delegate) {
      var openFn = $delegate.open;

      $delegate.open = function () {
        var args = [].slice.call(arguments);
        return $rootScope.$currentModalInstance = openFn.apply($delegate, args);
      };

      return $delegate;
    });
  })
  .config(function ($provide) {
    // this demonstrates how to register a new tool and add it to the default toolbar
    $provide.decorator('taOptions', function ($delegate) {
      $delegate.toolbar = [
        ['h2', 'h3', 'h4', 'h5', 'p'],
        ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
        ['insertLink', 'insertVideo', 'wordcount', 'charcount']

        /* defaults
         ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
         ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
         ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
         ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
         */
      ];
      return $delegate;
    });
  })
  .config(function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = false;
    //uncomment to test
    cfpLoadingBarProvider.latencyThreshold = 0;
    cfpLoadingBarProvider.spinnerTemplate = '<div class="overlay"><i class="fa fa-spinner fa-spin"></i></div>';
  })
  .run(function ($rootScope, $window, Auth, $state) {
    function toArray(v) {
      return angular.isArray(v) ? v : [v];
    }

    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function (loggedIn) {
        if (!loggedIn && next.authenticate) {
          event.preventDefault();
          return next.ifNotAuthenticate ? $state.go(next.ifNotAuthenticate) : $state.go('main');
        }

        var requiredRoles = next.requiredRole ? toArray(next.requiredRole) : [];

        if (requiredRoles.length &&
          (!loggedIn || requiredRoles.indexOf(Auth.getCurrentUser().role) === -1)) {
          event.preventDefault();
          return $state.go('main');
        }
      });
    });

    $rootScope.$on('$stateChangeStart', function closeModalDialog(event, next) {
      if ($rootScope.$currentModalInstance) {
        $rootScope.$currentModalInstance.dismiss();
      }
    });

    $rootScope.$on('$stateChangeStart', function scrollToTop() {
      $window.scroll(0, 0);
    });
  })
  .run(function ($rootScope, $location) {
    $rootScope.isActive = function (route, strict) {
      return strict
        ? route === $location.path()
        : $location.path().indexOf(route) === 0;
    }
  });
