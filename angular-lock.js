;(function() {

  'use strict';

  angular
    .module('auth0.lock', [])
    .provider('lock', lock);
  
  function lock() {
    if (typeof Auth0Lock !== 'function') {
      throw new Error('Auth0Lock must be loaded.');
    }

    this.init = function(config) {
      if (!config) {
        throw new Error('clientID and domain must be provided to lock');
      }
      this.clientID = config.clientID;
      this.domain = config.domain;
      this.options = config.options || {};
    }

    this.$inject = ['$rootScope'];

    this.$get = function($rootScope) {
      
      var Lock = new Auth0Lock(this.clientID, this.domain, this.options);
      var lock = {};

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

      lock.show = function() {
        Lock.show();
      }

      lock.hide = function() {
        Lock.hide();
      }

      lock.on = function(event, cb) {
        var lockEvents = ['show', 'hide', 'error', 'authenticated', 'authorization_error'];
        if(lockEvents.indexOf(event) !== -1) {
          Lock.on(event, function(data) {
            safeApply(function() {
              cb(data);
            });
          });
        }
      }

      lock.getProfile = function(token, cb) {
        Lock.getProfile(token, function(error, data) {
          safeApply(function() {
            cb(error, data);
          });
        });
      }

      return lock;
      
    }
  }
})();