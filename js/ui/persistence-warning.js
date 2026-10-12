(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};
  MeuRitmo.UI = MeuRitmo.UI || {};

  MeuRitmo.UI.PersistenceWarning = {
    showIfNeeded: function (storage) {
      var warning;
      var message;

      if (storage.isPersistent() || document.querySelector('.persistence-warning')) {
        return;
      }

      warning = document.createElement('aside');
      message = document.createElement('p');
      warning.className = 'persistence-warning';
      warning.setAttribute('role', 'status');
      message.className = 'shell';
      message.textContent = 'Seus dados estão apenas na memória e serão perdidos ao fechar ou recarregar esta página.';
      warning.appendChild(message);
      document.querySelector('.site-header').insertAdjacentElement('afterend', warning);
    }
  };
}(window));
