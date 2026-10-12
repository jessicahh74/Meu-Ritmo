(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};
  var prefix = MeuRitmo.Config.storagePrefix;

  function getBrowserStorage() {
    try {
      return global.localStorage;
    } catch (error) {
      return null;
    }
  }

  function create(backend) {
    var memory = Object.create(null);
    var persistent = false;
    var probeKey = prefix + '__availability_test__';

    try {
      if (backend) {
        backend.setItem(probeKey, '1');
        backend.removeItem(probeKey);
        persistent = true;
      }
    } catch (error) {
      persistent = false;
    }

    function useMemoryOnly() {
      persistent = false;
    }

    return {
      get: function (key, fallback) {
        var logicalKey = String(key);
        var rawValue;

        if (persistent) {
          try {
            rawValue = backend.getItem(prefix + logicalKey);
            if (rawValue !== null) {
              try {
                return JSON.parse(rawValue);
              } catch (parseError) {
                memory[logicalKey] = fallback;
                return fallback;
              }
            }
          } catch (error) {
            useMemoryOnly();
          }
        }

        return Object.prototype.hasOwnProperty.call(memory, logicalKey)
          ? memory[logicalKey]
          : fallback;
      },
      set: function (key, value) {
        var logicalKey = String(key);
        var serialized;

        memory[logicalKey] = value;

        try {
          serialized = JSON.stringify(value);
        } catch (error) {
          return false;
        }

        if (serialized === undefined || !persistent) {
          return false;
        }

        try {
          backend.setItem(prefix + logicalKey, serialized);
          return true;
        } catch (error) {
          useMemoryOnly();
          return false;
        }
      },
      remove: function (key) {
        var logicalKey = String(key);

        delete memory[logicalKey];

        if (!persistent) {
          return false;
        }

        try {
          backend.removeItem(prefix + logicalKey);
          return true;
        } catch (error) {
          useMemoryOnly();
          return false;
        }
      },
      isPersistent: function () {
        return persistent;
      }
    };
  }

  MeuRitmo.Storage = create(getBrowserStorage());
  MeuRitmo.Storage.create = create;
}(window));
