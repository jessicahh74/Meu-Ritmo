(function (global) {
  'use strict';

  global.MeuRitmo.UI.HomeView = {
    render: function (container) {
      global.MeuRitmo.UI.renderPlaceholder(container, {
        title: 'Seu estudo, no seu ritmo',
        description: 'Descubra onde concentrar seus esforços e organize seu tempo de estudo.',
        links: [
          { href: '#/mapa', label: 'Conhecer o Mapa' },
          { href: '#/ritmo', label: 'Abrir Ritmo de Estudos', secondary: true }
        ]
      });
    }
  };
}(window));
