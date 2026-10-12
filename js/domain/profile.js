(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};

  function isValidGrade(grade) {
    return Number.isInteger(grade) && grade >= 1 && grade <= 3;
  }

  function create(storage, clock) {
    var now = typeof clock === 'function' ? clock : Date.now;
    var key = MeuRitmo.Config.storageKeys.profile;

    function get() {
      var profile = storage.get(key, null);

      if (!profile || !isValidGrade(profile.grade) ||
          !Number.isFinite(profile.createdAt) || !Number.isFinite(profile.updatedAt)) {
        return null;
      }

      return profile;
    }

    return Object.freeze({
      get: get,
      getGrade: function () {
        var profile = get();
        return profile ? profile.grade : null;
      },
      setGrade: function (grade) {
        var current;
        var timestamp;
        var profile;

        if (!isValidGrade(grade)) {
          return null;
        }

        current = get();
        timestamp = now();
        profile = {
          grade: grade,
          createdAt: current ? current.createdAt : timestamp,
          updatedAt: timestamp
        };
        storage.set(key, profile);
        return profile;
      },
      isValidGrade: isValidGrade
    });
  }

  var defaultProfile = create(MeuRitmo.Storage);
  MeuRitmo.Profile = Object.freeze({
    get: defaultProfile.get,
    getGrade: defaultProfile.getGrade,
    setGrade: defaultProfile.setGrade,
    isValidGrade: defaultProfile.isValidGrade,
    create: create
  });
}(window));
