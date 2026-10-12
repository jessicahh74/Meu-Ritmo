(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo;
  var controller = MeuRitmo.Pomodoro.create();
  var lastSummary = null;

  function formatClock(milliseconds) {
    var totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;

    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  }

  function phaseLabel(phase) {
    return {
      focus: 'Foco',
      shortBreak: 'Intervalo curto',
      longBreak: 'Intervalo longo'
    }[phase] || 'Pronto para começar';
  }

  function statusText(snapshot) {
    if (snapshot.status === 'idle') {
      return 'Escolha uma matéria e inicie quando estiver pronto.';
    }
    if (snapshot.status === 'paused') {
      return 'Cronômetro pausado.';
    }
    if (snapshot.status === 'waiting') {
      return 'Intervalo concluído. Inicie o próximo foco quando estiver pronto.';
    }
    if (snapshot.phase === 'focus') {
      return 'Tempo de foco em andamento.';
    }
    return 'Faça uma pausa. O tempo de intervalo não conta como estudo.';
  }

  function titleFor(snapshot) {
    if (snapshot.status === 'idle') {
      return 'Ritmo de Estudos | ' + MeuRitmo.Config.appName;
    }
    if (snapshot.status === 'waiting') {
      return 'Intervalo concluído | ' + MeuRitmo.Config.appName;
    }
    return phaseLabel(snapshot.phase) + ' — ' + formatClock(snapshot.phaseRemainingMs) +
      ' | ' + MeuRitmo.Config.appName;
  }

  function createSummary(summary) {
    var card = document.createElement('section');
    var title = document.createElement('h2');
    var text = document.createElement('p');

    card.className = 'timer-summary';
    title.textContent = summary.saved ? 'Sessão registrada' : 'Sessão encerrada';
    if (summary.saved) {
      var subject = MeuRitmo.Subjects.getById(summary.saved.subjectId);

      text.textContent = subject.name + ' • ' +
        MeuRitmo.Utils.formatDuration(summary.saved.focusSeconds) + ' de foco • ' +
        summary.saved.pomodorosCompleted +
        (summary.saved.pomodorosCompleted === 1 ? ' pomodoro concluído' : ' pomodoros concluídos');
    } else {
      text.textContent = 'Nenhum tempo de foco foi registrado nesta sessão.';
    }
    card.appendChild(title);
    card.appendChild(text);
    return card;
  }

  MeuRitmo.UI.TimerView = {
    render: function (container) {
      var profile = MeuRitmo.Profile.get();
      var section = document.createElement('section');
      var title = document.createElement('h1');
      var description = document.createElement('p');
      var timerCard = document.createElement('section');
      var subjectLabel = document.createElement('label');
      var subjectSelect = document.createElement('select');
      var phase = document.createElement('p');
      var time = document.createElement('p');
      var state = document.createElement('p');
      var selectedSubject = document.createElement('p');
      var progress = document.createElement('p');
      var actions = document.createElement('div');
      var startButton = document.createElement('button');
      var pauseButton = document.createElement('button');
      var finishButton = document.createElement('button');
      var feedback = document.createElement('p');
      var summaryArea = document.createElement('div');
      var historyLink = document.createElement('a');
      var intervalId;

      section.className = 'timer-shell';
      title.textContent = 'Ritmo de Estudos';
      description.textContent = 'Estude com ciclos de foco e pausas simples. Série atual: ' +
        profile.grade + 'º ano.';
      timerCard.className = 'timer-card';
      timerCard.setAttribute('aria-labelledby', 'timer-phase');
      subjectLabel.setAttribute('for', 'timer-subject');
      subjectLabel.textContent = 'Matéria';
      subjectSelect.id = 'timer-subject';
      subjectSelect.appendChild(new Option('Selecione uma matéria', ''));
      MeuRitmo.Subjects.all.forEach(function (subject) {
        subjectSelect.appendChild(new Option(subject.name, subject.id));
      });
      phase.id = 'timer-phase';
      phase.className = 'timer-phase';
      time.className = 'timer-time';
      time.setAttribute('role', 'timer');
      state.className = 'timer-state';
      state.setAttribute('aria-live', 'polite');
      selectedSubject.className = 'timer-subject-name';
      progress.className = 'timer-progress';
      actions.className = 'timer-actions';
      startButton.type = 'button';
      startButton.className = 'action-button';
      startButton.textContent = 'Iniciar';
      pauseButton.type = 'button';
      pauseButton.className = 'action-button secondary';
      pauseButton.textContent = 'Pausar';
      finishButton.type = 'button';
      finishButton.className = 'action-button secondary';
      finishButton.textContent = 'Finalizar';
      feedback.className = 'timer-feedback';
      feedback.setAttribute('aria-live', 'polite');
      historyLink.className = 'button-link secondary timer-history-link';
      historyLink.href = '#/ritmo/historico';
      historyLink.textContent = 'Ver histórico de estudo';

      actions.appendChild(startButton);
      actions.appendChild(pauseButton);
      actions.appendChild(finishButton);
      timerCard.appendChild(subjectLabel);
      timerCard.appendChild(subjectSelect);
      timerCard.appendChild(phase);
      timerCard.appendChild(time);
      timerCard.appendChild(state);
      timerCard.appendChild(selectedSubject);
      timerCard.appendChild(progress);
      timerCard.appendChild(actions);
      timerCard.appendChild(feedback);
      section.appendChild(title);
      section.appendChild(description);
      section.appendChild(timerCard);
      section.appendChild(summaryArea);
      section.appendChild(historyLink);
      container.replaceChildren(section);

      function update() {
        var snapshot = controller.getSnapshot();
        var subject = MeuRitmo.Subjects.getById(snapshot.subjectId || subjectSelect.value);
        var remaining = snapshot.status === 'idle'
          ? MeuRitmo.Config.pomodoro.focusMs
          : snapshot.phaseRemainingMs;

        phase.textContent = phaseLabel(snapshot.phase);
        time.textContent = formatClock(remaining);
        time.setAttribute('aria-label', phaseLabel(snapshot.phase) + ': ' +
          Math.ceil(remaining / 1000) + ' segundos restantes');
        state.textContent = statusText(snapshot);
        selectedSubject.textContent = subject
          ? 'Matéria selecionada: ' + subject.name
          : 'Nenhuma matéria selecionada.';
        progress.textContent = 'Tempo estudado: ' +
          MeuRitmo.Utils.formatDuration(Math.floor(snapshot.focusAccumulatedMs / 1000)) +
          ' • Pomodoros concluídos: ' + snapshot.pomodorosCompleted;

        if (snapshot.subjectId) {
          subjectSelect.value = snapshot.subjectId;
        }
        subjectSelect.disabled = snapshot.status !== 'idle';
        startButton.textContent = snapshot.status === 'waiting'
          ? 'Iniciar próximo foco'
          : 'Iniciar';
        startButton.disabled = snapshot.status === 'idle'
          ? !subjectSelect.value
          : snapshot.status !== 'waiting';
        pauseButton.textContent = snapshot.status === 'paused' ? 'Retomar' : 'Pausar';
        pauseButton.disabled = snapshot.status !== 'running' && snapshot.status !== 'paused';
        finishButton.disabled = snapshot.status === 'idle';
        document.title = titleFor(snapshot);
      }

      subjectSelect.addEventListener('change', function () {
        feedback.textContent = '';
        update();
      });

      startButton.addEventListener('click', function () {
        var snapshot = controller.getSnapshot();
        var started;

        feedback.textContent = '';
        if (snapshot.status === 'waiting') {
          started = controller.startNextFocus();
        } else {
          started = controller.start(subjectSelect.value);
          if (started) {
            lastSummary = null;
            summaryArea.replaceChildren();
          }
        }
        if (!started) {
          feedback.textContent = 'Selecione uma matéria antes de iniciar.';
        }
        update();
      });

      pauseButton.addEventListener('click', function () {
        var snapshot = controller.getSnapshot();

        feedback.textContent = '';
        if (snapshot.status === 'paused') {
          controller.resume();
        } else {
          controller.pause();
        }
        update();
      });

      finishButton.addEventListener('click', function () {
        var session = controller.finish();
        var saved = session ? MeuRitmo.StudyLog.save(session) : null;

        lastSummary = { session: session, saved: saved };
        summaryArea.replaceChildren(createSummary(lastSummary));
        feedback.textContent = saved
          ? 'Sessão salva com sucesso.'
          : 'Sessão encerrada sem tempo de foco suficiente para salvar.';
        update();
      });

      if (lastSummary) {
        summaryArea.appendChild(createSummary(lastSummary));
      }
      update();
      intervalId = global.setInterval(update, 250);
      container.focus({ preventScroll: true });

      return {
        destroy: function () {
          global.clearInterval(intervalId);
        }
      };
    }
  };
}(window));
