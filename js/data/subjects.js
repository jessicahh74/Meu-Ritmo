(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};
  var subjects = Object.freeze([
    Object.freeze({ id: 'matematica', name: 'Matemática' }),
    Object.freeze({ id: 'portugues', name: 'Português' }),
    Object.freeze({ id: 'historia', name: 'História' }),
    Object.freeze({ id: 'geografia', name: 'Geografia' })
  ]);

  MeuRitmo.Subjects = Object.freeze({
    all: subjects,
    getById: function (subjectId) {
      return subjects.find(function (subject) {
        return subject.id === subjectId;
      });
    }
  });
}(window));
