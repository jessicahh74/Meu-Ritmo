(function (global) {
  'use strict';

  var tests = [];

  function printable(value) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return String(value);
    }
  }

  function fail(message) {
    throw new Error(message);
  }

  global.TestRunner = {
    test: function (name, callback) {
      tests.push({ name: name, callback: callback });
    },
    assert: function (condition, message) {
      if (!condition) {
        fail(message || 'A condição deveria ser verdadeira.');
      }
    },
    equal: function (actual, expected, message) {
      if (actual !== expected) {
        fail((message ? message + ': ' : '') +
          'esperado ' + printable(expected) + ', recebido ' + printable(actual));
      }
    },
    deepEqual: function (actual, expected, message) {
      if (printable(actual) !== printable(expected)) {
        fail((message ? message + ': ' : '') +
          'esperado ' + printable(expected) + ', recebido ' + printable(actual));
      }
    },
    run: function () {
      var results = document.getElementById('results');
      var summary = document.getElementById('summary');
      var passed = 0;

      tests.forEach(function (test) {
        var item = document.createElement('li');

        try {
          test.callback();
          item.className = 'pass';
          item.textContent = '✔ ' + test.name;
          passed += 1;
        } catch (error) {
          var details = document.createElement('pre');
          item.className = 'fail';
          item.textContent = '✘ ' + test.name;
          details.textContent = error.message;
          item.appendChild(details);
        }

        results.appendChild(item);
      });

      summary.className = passed === tests.length ? 'pass' : 'fail';
      summary.textContent = passed + '/' + tests.length + ' testes aprovados';
      document.title = summary.textContent + ' | Testes do Meu Ritmo';
    }
  };
}(window));
