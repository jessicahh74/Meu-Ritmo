(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};

  function escapePattern(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function compile(pattern) {
    var keys = [];
    var parts = MeuRitmo.Utils.normalizeHash(pattern).split('/');
    var source = parts.map(function (part) {
      if (part.charAt(0) === ':') {
        keys.push(part.slice(1));
        return '([^/]+)';
      }

      return escapePattern(part);
    }).join('/');

    return {
      keys: keys,
      expression: new RegExp('^' + source + '$')
    };
  }

  function create(options) {
    var routes = (options.routes || []).map(function (route) {
      var compiled = compile(route.path);
      return {
        path: route.path,
        view: route.view,
        section: route.section,
        keys: compiled.keys,
        expression: compiled.expression
      };
    });
    var fallback = options.fallback;
    var currentView = null;
    var started = false;

    function match(hash) {
      var normalizedHash = MeuRitmo.Utils.normalizeHash(hash);

      for (var index = 0; index < routes.length; index += 1) {
        var route = routes[index];
        var values = normalizedHash.match(route.expression);

        if (values) {
          var params = {};
          route.keys.forEach(function (key, keyIndex) {
            try {
              params[key] = decodeURIComponent(values[keyIndex + 1]);
            } catch (error) {
              params[key] = values[keyIndex + 1];
            }
          });

          return { route: route, params: params };
        }
      }

      return { route: fallback, params: {} };
    }

    function renderCurrentRoute() {
      var matched = match(global.location.hash);

      if (currentView && typeof currentView.destroy === 'function') {
        currentView.destroy();
      }

      currentView = matched.route.view.render(options.container, matched.params) || null;

      if (typeof options.onNavigate === 'function') {
        options.onNavigate(matched.route);
      }
    }

    return {
      start: function () {
        if (started) {
          return;
        }

        started = true;
        global.addEventListener('hashchange', renderCurrentRoute);
        renderCurrentRoute();
      },
      stop: function () {
        if (!started) {
          return;
        }

        global.removeEventListener('hashchange', renderCurrentRoute);
        if (currentView && typeof currentView.destroy === 'function') {
          currentView.destroy();
        }
        currentView = null;
        started = false;
      },
      navigate: function (hash) {
        global.location.hash = MeuRitmo.Utils.normalizeHash(hash);
      },
      refresh: function () {
        if (started) {
          renderCurrentRoute();
        }
      }
    };
  }

  MeuRitmo.Router = { create: create };
}(window));
