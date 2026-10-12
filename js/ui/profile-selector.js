(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};
  MeuRitmo.UI = MeuRitmo.UI || {};

  function ordinal(grade) {
    return grade + 'º ano';
  }

  function createGradeOption(grade) {
    var label = document.createElement('label');
    var input = document.createElement('input');
    var text = document.createElement('span');

    label.className = 'grade-option';
    input.type = 'radio';
    input.name = 'grade';
    input.value = String(grade);
    input.required = true;
    text.textContent = ordinal(grade);
    label.appendChild(input);
    label.appendChild(text);
    return label;
  }

  MeuRitmo.UI.ProfileSelector = {
    init: function (options) {
      var profile = options.profile;
      var trigger = options.trigger;
      var backdrop = document.createElement('div');
      var dialog = document.createElement('section');
      var title = document.createElement('h2');
      var description = document.createElement('p');
      var form = document.createElement('form');
      var fields = document.createElement('fieldset');
      var legend = document.createElement('legend');
      var actions = document.createElement('div');
      var cancel = document.createElement('button');
      var save = document.createElement('button');

      backdrop.className = 'grade-dialog-backdrop';
      backdrop.hidden = true;
      dialog.className = 'grade-dialog';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-labelledby', 'grade-dialog-title');
      title.id = 'grade-dialog-title';
      title.textContent = 'Escolha sua série';
      description.textContent = 'Usaremos sua série para mostrar o conteúdo adequado.';
      legend.textContent = 'Em qual ano do Ensino Médio você está?';
      actions.className = 'grade-dialog-actions';
      cancel.type = 'button';
      cancel.textContent = 'Cancelar';
      save.type = 'submit';
      save.textContent = 'Salvar série';

      [1, 2, 3].forEach(function (grade) {
        fields.appendChild(createGradeOption(grade));
      });
      fields.prepend(legend);
      actions.appendChild(cancel);
      actions.appendChild(save);
      form.appendChild(fields);
      form.appendChild(actions);
      dialog.appendChild(title);
      dialog.appendChild(description);
      dialog.appendChild(form);
      backdrop.appendChild(dialog);
      document.body.appendChild(backdrop);

      function setPageLocked(locked) {
        Array.prototype.forEach.call(document.body.children, function (element) {
          if (element !== backdrop && element.tagName !== 'SCRIPT') {
            if (locked) {
              element.setAttribute('inert', '');
            } else {
              element.removeAttribute('inert');
            }
          }
        });
      }

      function updateTrigger() {
        var grade = profile.getGrade();
        trigger.textContent = grade ? 'Série: ' + ordinal(grade) : 'Definir série';
        trigger.setAttribute('aria-label', grade
          ? 'Alterar série atual: ' + ordinal(grade)
          : 'Definir série escolar');
      }

      function close() {
        if (!profile.get()) {
          return;
        }
        backdrop.hidden = true;
        setPageLocked(false);
        trigger.focus();
      }

      function open() {
        var current = profile.getGrade();
        var inputs = form.elements.grade;

        cancel.hidden = !current;
        Array.prototype.forEach.call(inputs, function (input) {
          input.checked = Number(input.value) === current;
        });
        backdrop.hidden = false;
        setPageLocked(true);
        (current ? form.querySelector('input:checked') : inputs[0]).focus();
      }

      trigger.addEventListener('click', open);
      cancel.addEventListener('click', close);
      backdrop.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
        }
      });
      form.addEventListener('submit', function (event) {
        var selected = form.querySelector('input[name="grade"]:checked');
        var saved;

        event.preventDefault();
        if (!selected) {
          return;
        }

        saved = profile.setGrade(Number(selected.value));
        if (!saved) {
          return;
        }

        updateTrigger();
        backdrop.hidden = true;
        setPageLocked(false);
        if (typeof options.onChange === 'function') {
          options.onChange(saved);
        }
        trigger.focus();
      });

      updateTrigger();
      if (!profile.get()) {
        open();
      }

      return Object.freeze({ open: open, close: close });
    }
  };
}(window));
