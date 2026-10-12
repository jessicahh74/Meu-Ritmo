(function (global) {
  'use strict';

  var test = global.TestRunner;
  var Storage = global.MeuRitmo.Storage;
  var prefix = global.MeuRitmo.Config.storagePrefix;

  function createBackend(initialValues) {
    var values = Object.assign(Object.create(null), initialValues || {});

    return {
      getItem: function (key) {
        return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null;
      },
      setItem: function (key, value) {
        values[key] = String(value);
      },
      removeItem: function (key) {
        delete values[key];
      }
    };
  }

  function createBlockedBackend() {
    return {
      getItem: function () { throw new Error('bloqueado'); },
      setItem: function () { throw new Error('bloqueado'); },
      removeItem: function () { throw new Error('bloqueado'); }
    };
  }

  test.test('get retorna fallback para chave inexistente', function () {
    var storage = Storage.create(createBackend());
    test.deepEqual(storage.get('inexistente', { vazio: true }), { vazio: true });
  });

  test.test('set e get preservam valores JSON', function () {
    var storage = Storage.create(createBackend());
    var value = { grade: 2, items: ['a', 'b'] };

    test.equal(storage.set('profile', value), true);
    test.deepEqual(storage.get('profile', null), value);
    test.equal(storage.isPersistent(), true);
  });

  test.test('remove apaga somente a chave solicitada', function () {
    var storage = Storage.create(createBackend());

    storage.set('um', 1);
    storage.set('dois', 2);
    test.equal(storage.remove('um'), true);
    test.equal(storage.get('um', null), null);
    test.equal(storage.get('dois', null), 2);
  });

  test.test('JSON corrompido retorna fallback sem lançar erro', function () {
    var initial = {};
    initial[prefix + 'corrompido'] = '{sem-json-valido';
    var storage = Storage.create(createBackend(initial));

    test.deepEqual(storage.get('corrompido', []), []);
    test.equal(storage.isPersistent(), true);
  });

  test.test('storage bloqueado usa memória sem lançar erro', function () {
    var storage = Storage.create(createBlockedBackend());

    test.equal(storage.isPersistent(), false);
    test.equal(storage.set('temporario', { valor: 3 }), false);
    test.deepEqual(storage.get('temporario', null), { valor: 3 });
    test.equal(storage.remove('temporario'), false);
    test.equal(storage.get('temporario', 'fallback'), 'fallback');
  });

  test.test('falha posterior no backend mantém o último valor em memória', function () {
    var backend = createBackend();
    var storage = Storage.create(backend);

    backend.setItem = function () { throw new Error('sem espaço'); };
    test.equal(storage.set('sessao', 42), false);
    test.equal(storage.isPersistent(), false);
    test.equal(storage.get('sessao', null), 42);
  });

  test.test('storage padrão permite set/get/remove mesmo sem persistência', function () {
    var key = '__runner_' + Date.now();
    var value = { ok: true };

    Storage.set(key, value);
    test.deepEqual(Storage.get(key, null), value);
    Storage.remove(key);
    test.equal(Storage.get(key, null), null);
  });
}(window));
