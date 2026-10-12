(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};
  MeuRitmo.UI = MeuRitmo.UI || {};

  function createLink(link) {
    var item = document.createElement('li');
    var anchor = document.createElement('a');
    anchor.className = 'button-link' + (link.secondary ? ' secondary' : '');
    anchor.href = link.href;
    anchor.textContent = link.label;
    item.appendChild(anchor);
    return item;
  }

  MeuRitmo.UI.renderPlaceholder = function (container, content) {
    var card = document.createElement('section');
    var title = document.createElement('h1');
    var description = document.createElement('p');
    var links = document.createElement('ul');

    card.className = 'placeholder-card';
    title.textContent = content.title;
    description.textContent = content.description;
    links.className = 'route-links';
    links.setAttribute('aria-label', 'Acessos desta página');

    (content.links || []).forEach(function (link) {
      links.appendChild(createLink(link));
    });

    card.appendChild(title);
    card.appendChild(description);
    if (links.children.length > 0) {
      card.appendChild(links);
    }

    container.replaceChildren(card);
    document.title = content.title + ' | ' + MeuRitmo.Config.appName;
    container.focus({ preventScroll: true });
  };
}(window));
