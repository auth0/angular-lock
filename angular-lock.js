;(function() {

  'use strict';

  var Auth0Lock = require('auth0-lock').default;

  angular
    .module('auth0.lock', [])
    .provider('lock', lock);

  function lock() {

    // Stub required functions to allow auth0-angular to initialize
    Auth0Lock.prototype.getClient = function() { void 0; };
    Auth0Lock.prototype.parseHash = function() { void 0; };

    this.init = function(config) {
      if (!config) {
        throw new Error('clientID and domain must be provided to lock');
      }
      this.clientID = config.clientID;
      this.domain = config.domain;
      this.options = config.options || {};
    };

    this.$get = ["$rootScope", function($rootScope) {

      var Lock = new Auth0Lock(this.clientID, this.domain, this.options);
      var credentials = {clientID: this.clientID, domain: this.domain};
      var lock = {};
      var functions = [];
      for (var i in Lock) {
        if(typeof Lock[i] === 'function') {
          functions.push(i);
        }
      }

      function safeApply(fn) {
        var phase = $rootScope.$root.$$phase;
        if(phase === '$apply' || phase === '$digest') {
          if(fn && (typeof(fn) === 'function')) {
            fn();
          }
        } else {
          $rootScope.$apply(fn);
        }
      }

      function wrapArguments(parameters) {
        var lastIndex = parameters.length - 1,
          func = parameters[lastIndex];
        if(typeof func === 'function') {
          parameters[lastIndex] = function() {
            var args = arguments;
            safeApply(function() {
              func.apply(Lock, args)
            })
          }
        }
        return parameters;
      }

      for (var i = 0; i < functions.length; i++) {
        lock[functions[i]]  = (function(name){
          var customFunction = function() {
            return Lock[name].apply(Lock, wrapArguments(arguments) );
          };
          return customFunction;
        })(functions[i]);
      }

      lock.interceptHash = function() {
        $rootScope.$on('$locationChangeStart', function(event, location) {

          if (/id_token=/.test(location) || /error=/.test(location)) {
            var auth0 = new Auth0(credentials);

            // Hash simulation for html5Mode(true).
            var hash = (window.location.hash) ? window.location.hash : '#' + location.replace(/http.?:\/\/[^/]+/,'').slice(1);

            var authResult = auth0.parseHash(hash);
          }

          if (authResult && authResult.idToken) {
            Lock.emit('authenticated', authResult);
          }

          if (authResult && authResult.error) {
            Lock.emit('authorization_error', authResult);
          }

        });
      };

      return lock;
    }]
  }
})();
