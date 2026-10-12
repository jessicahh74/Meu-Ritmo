(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo;
  var view = document.getElementById('view');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var gradeButton = document.getElementById('grade-button');

  MeuRitmo.UI.PersistenceWarning.showIfNeeded(MeuRitmo.Storage);

  MeuRitmo.UI.ProfileSelector.init({
    profile: MeuRitmo.Profile,
    trigger: gradeButton,
    onChange: function () {
      MeuRitmo.App.refresh();
    }
  });

  function requiresProfile(viewModule) {
    return {
      render: function (container, params) {
        if (!MeuRitmo.Profile.get()) {
          if (global.location.hash !== '#/') {
            global.location.hash = '#/';
          }
          return MeuRitmo.UI.HomeView.render(container, {});
        }

        return viewModule.render(container, params);
      }
    };
  }

  var routeDefinitions = [
    { path: '#/', view: MeuRitmo.UI.HomeView, section: 'home' },
    { path: '#/mapa', view: requiresProfile(MeuRitmo.UI.MapView), section: 'mapa' },
    { path: '#/mapa/avaliar/:subjectId', view: requiresProfile(MeuRitmo.UI.QuizView), section: 'mapa' },
    { path: '#/mapa/resultado', view: requiresProfile(MeuRitmo.UI.ResultView), section: 'mapa' },
    { path: '#/mapa/historico', view: requiresProfile(MeuRitmo.UI.AssessmentHistoryView), section: 'mapa' },
    { path: '#/ritmo', view: requiresProfile(MeuRitmo.UI.TimerView), section: 'ritmo' },
    { path: '#/ritmo/historico', view: requiresProfile(MeuRitmo.UI.StudyHistoryView), section: 'ritmo' }
  ];

  function updateNavigation(route) {
    navLinks.forEach(function (link) {
      if (link.dataset.nav === route.section) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  MeuRitmo.App = MeuRitmo.Router.create({
    container: view,
    routes: routeDefinitions,
    fallback: routeDefinitions[0],
    onNavigate: updateNavigation
  });

  MeuRitmo.App.start();
}(window));
