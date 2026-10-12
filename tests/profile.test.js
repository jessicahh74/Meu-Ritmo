(function (global) {
  'use strict';

  var test = global.TestRunner;
  var Profile = global.MeuRitmo.Profile;
  var Storage = global.MeuRitmo.Storage;

  function createBackend() {
    var values = Object.create(null);
    return {
      getItem: function (key) {
        return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null;
      },
      setItem: function (key, value) { values[key] = String(value); },
      removeItem: function (key) { delete values[key]; }
    };
  }

  test.test('profile retorna vazio quando ainda não há série válida', function () {
    var profile = Profile.create(Storage.create(createBackend()), function () { return 1000; });
    test.equal(profile.get(), null);
    test.equal(profile.getGrade(), null);
  });

  test.test('profile ignora registro com schema inválido', function () {
    var storage = Storage.create(createBackend());
    var profile;

    storage.set(global.MeuRitmo.Config.storageKeys.profile, { grade: 2 });
    profile = Profile.create(storage, function () { return 1000; });
    test.equal(profile.get(), null);
  });

  test.test('profile rejeita séries fora de 1 a 3', function () {
    var profile = Profile.create(Storage.create(createBackend()), function () { return 1000; });

    [0, 4, 1.5, '2', null].forEach(function (grade) {
      test.equal(profile.setGrade(grade), null);
    });
    test.equal(profile.get(), null);
  });

  test.test('profile salva série e timestamps no primeiro acesso', function () {
    var profile = Profile.create(Storage.create(createBackend()), function () { return 1234; });

    test.deepEqual(profile.setGrade(2), {
      grade: 2,
      createdAt: 1234,
      updatedAt: 1234
    });
    test.equal(profile.getGrade(), 2);
  });

  test.test('profile preserva createdAt ao trocar a série', function () {
    var timestamp = 1000;
    var profile = Profile.create(Storage.create(createBackend()), function () { return timestamp; });

    profile.setGrade(1);
    timestamp = 2000;
    test.deepEqual(profile.setGrade(3), {
      grade: 3,
      createdAt: 1000,
      updatedAt: 2000
    });
  });

  test.test('profile persiste após recriação do módulo', function () {
    var storage = Storage.create(createBackend());
    var firstInstance = Profile.create(storage, function () { return 5000; });
    var secondInstance;

    firstInstance.setGrade(2);
    secondInstance = Profile.create(storage, function () { return 6000; });
    test.equal(secondInstance.getGrade(), 2);
    test.equal(secondInstance.get().createdAt, 5000);
  });
}(window));
