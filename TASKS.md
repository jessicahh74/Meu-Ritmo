# TASKS.md — Meu Ritmo (MVP)

Documento de referência: `ARCHITECTURE.md`. Cada tarefa deve ser entregue, testada e reportada individualmente antes da próxima.

## Instruções gerais para o Codex (valem para todas as tarefas)

1. Somente HTML5, CSS3 e JS puro. Sem frameworks, bibliotecas, CDN, fontes externas, APIs, backend ou build.
2. Scripts clássicos em IIFE sob o namespace `window.MeuRitmo`; ordem de carga em `index.html`: `core → data → domain → ui → app.js`.
3. Só `core/storage.js` acessa `localStorage`. Só `ui/` acessa o DOM. `domain/` é puro.
4. Respeitar nomes de arquivos e contratos de `ARCHITECTURE.md`. Se precisar divergir, justificar no relatório.
5. Fazer **apenas** o escopo da tarefa. Não antecipar tarefas futuras nem adicionar funcionalidades.
6. Código simples e legível; comentários só onde a regra não é óbvia. Textos de interface em português do Brasil.
7. Interface responsiva (320px → desktop), navegável por teclado, cor nunca como único sinal.
8. Ao terminar, entregar relatório com: arquivos criados/alterados; o que foi feito; como testar (passo a passo); testes executados e resultado; desvios/dúvidas; pendências.

**Prioridades:** P0 = essencial para o MVP rodar; P1 = requisito do enunciado; P2 = robustez/polimento.

---

## Fase 0 — Fundação

### T01 — Esqueleto do projeto e roteador · P0
- **Depende de:** —
- **Objetivo:** criar a estrutura de diretórios, `index.html` com header/nav/`<main>`, CSS base, `config.js`, `utils.js`, `router.js` e views placeholder para cada rota.
- **Rotas:** `#/` (home), `#/mapa`, `#/mapa/avaliar/:subjectId`, `#/mapa/resultado`, `#/mapa/historico`, `#/ritmo`, `#/ritmo/historico`.
- **Critérios de aceitação:**
  - Abrir `index.html` por duplo clique (`file://`) mostra a home sem erros no console.
  - Navegar entre rotas troca o conteúdo sem recarregar; botão voltar do navegador funciona.
  - Rota desconhecida cai na home.
  - Layout não quebra em 360px.
- **Testes:** abrir em `file://` e navegar manualmente por todas as rotas; checar console limpo.

### T02 — Storage seguro e utilitários · P0
- **Depende de:** T01
- **Objetivo:** implementar `storage.js` (get/set/remove/isPersistent, prefixo `meuRitmo:v1:`, fallback em memória, JSON corrompido → fallback) e `utils.js` (`newId`, `dateKey`, `weekKey`, `formatDuration`, `formatPercent`). Criar `tests/runner.html` + `tests/assert.js`.
- **Critérios de aceitação:**
  - Nenhuma função lança exceção com `localStorage` bloqueado ou JSON inválido.
  - `weekKey` agrupa segunda a domingo (local).
  - `formatDuration(3725)` → formato legível (ex.: `1h 02min`), definido e testado.
  - `tests/runner.html` exibe lista de ✔/✘ e total.
- **Testes:** testes automatizados no runner (get de chave inexistente, valor corrompido, set/get, limites de semana, virada de mês/ano); teste manual com storage bloqueado.

### T03 — Matérias e faixas de cor (dados e constantes) · P0
- **Depende de:** T01
- **Objetivo:** `subjects.js` com as 4 matérias e `config.js` com limiares das faixas (80/60/40) e nomes/rótulos/ícones/cores das faixas em variáveis CSS.
- **Critérios de aceitação:** ids exatamente `matematica`, `portugues`, `historia`, `geografia`; faixas definidas em um único lugar; as 4 cores têm rótulo textual.
- **Testes:** teste no runner verificando as 4 matérias e a configuração das faixas.

---

## Fase 1 — Mapa das Dificuldades

### T04 — Módulo de pontuação (`scoring.js`) · P0 · ✅ Concluída
- **Depende de:** T03
- **Objetivo:** `grade`, `bandFor`, `rank`, funções puras.
- **Critérios de aceitação:**
  - `bandFor`: 100→verde, 80→verde, 79→amarelo, 60→amarelo, 59→laranja, 40→laranja, 39→vermelho, 0→vermelho.
  - `grade` trata questão não respondida (`null`) como incorreta.
  - `rank` ordena do menor para o maior %; desempate pela ordem fixa das matérias; ignora/segrega matérias sem avaliação.
- **Testes:** casos de borda acima, 0/5 a 5/5, todas respondidas e nenhuma respondida, empates no ranking.

### T05 — Perfil: escolha da série · P0 · ✅ Concluída
- **Depende de:** T01, T02
- **Objetivo:** `profile.js` + seletor de série (1º/2º/3º ano) no primeiro acesso e alteração posterior pelo header.
- **Critérios de aceitação:**
  - Sem perfil salvo, o app pede a série antes de liberar o Mapa e o Ritmo.
  - Série persiste após recarregar; trocá-la atualiza o header e as telas.
  - Valores fora de 1–3 são rejeitados.
- **Testes:** unitário de `profile`; manual: primeiro acesso, recarga, troca de série.

### T06 — Banco de questões · P0 · ✅ Concluída
- **Depende de:** T03
- **Objetivo:** criar `questions-1ano.js`, `questions-2ano.js`, `questions-3ano.js` e `Questions.get(grade, subjectId)`. Entregar em **três etapas** (uma por série) se preferir, cada uma com seu relatório.
- **Critérios de aceitação:**
  - 60 questões no total: 5 por série × matéria.
  - Cada questão: id único, enunciado, 4 alternativas, `correctIndex` válido, `topic`.
  - Conteúdo adequado ao Ensino Médio da série, claro, sem ambiguidade, sem alternativas "todas as anteriores".
  - Marcar no relatório que o conteúdo precisa de revisão por professor.
- **Testes:** teste de integridade no runner (contagem, ids únicos, índices válidos, 4 alternativas, sem alternativas duplicadas na mesma questão).

### T07 — Persistência de avaliações (`assessments.js`) · P0 · ✅ Concluída
- **Depende de:** T02, T04
- **Objetivo:** `save`, `history`, `latestBySubject`, `evolution` conforme o modelo de dados.
- **Critérios de aceitação:**
  - `latestBySubject(grade)` ignora avaliações de outras séries.
  - `evolution` retorna ordem cronológica com `delta` (primeira avaliação: `delta = null`).
  - `history` ordena da mais recente para a mais antiga e aceita filtros.
- **Testes:** unitários com dados fabricados (várias séries/matérias/datas), lista vazia, dados corrompidos.

### T08 — Tela do questionário e resultado · P0 · ✅ Concluída
- **Depende de:** T05, T06, T07
- **Objetivo:** `view-quiz.js` e `view-result.js`: escolher matéria → responder 5 questões → enviar → corrigir, salvar e mostrar resultado.
- **Critérios de aceitação:**
  - Apresenta somente questões da série do perfil e da matéria escolhida.
  - Mostra progresso (ex.: 2/5); é possível voltar e alterar resposta antes de enviar.
  - Avisa se houver questões sem resposta, sem bloquear o envio.
  - Resultado mostra acertos, %, faixa (cor + rótulo + texto encorajador) e gabarito comentando qual era a alternativa correta.
  - A avaliação é salva uma única vez (recarregar o resultado não duplica).
  - Embaralhar ordem de questões/alternativas: **opcional**, implementar apenas se não complicar; a correção deve ser por `questionId` e índice original.
- **Testes:** manual: responder tudo certo (100% verde), tudo errado (vermelho), parcial, deixar em branco; conferir `localStorage` e ausência de duplicata ao recarregar.

### T09 — Mapa: cartões e ranking · P1 · ✅ Concluída
- **Depende de:** T04, T07, T08
- **Objetivo:** `view-map.js`: cartão por matéria com última nota, faixa e data; ranking "onde focar"; botão para avaliar/refazer; estado vazio para matérias sem avaliação.
- **Critérios de aceitação:**
  - Ranking exibe do menor para o maior desempenho; matérias sem avaliação aparecem à parte com chamada para fazer o questionário.
  - Cada cartão indica faixa por cor **e** texto.
  - Trocar de série mostra apenas dados da série atual.
- **Testes:** manual com 0, 1, 2 e 4 matérias avaliadas; empate de notas.

### T10 — Histórico de avaliações, comparação e evolução · P1 · ✅ Concluída
- **Depende de:** T07, T09 (e cria `charts.js` com gráfico de linha)
- **Objetivo:** `view-assessment-history.js` + `Charts.line`: lista de avaliações (filtro por matéria), variação em relação à anterior (▲/▼/=), gráfico de evolução por matéria.
- **Critérios de aceitação:**
  - Lista com data, matéria, %, faixa, variação.
  - Gráfico mostra pontos cronológicos e faixas de cor de fundo ou marcadores com rótulo; com 1 só ponto, mostra o ponto sem erro.
  - Comparação por matéria: primeira vs última avaliação e melhor resultado.
  - Estado vazio amigável.
  - SVG responsivo (sem rolagem horizontal da página em 360px).
- **Testes:** manual com 0, 1, 2 e muitas avaliações; unitário do cálculo de comparação se for extraído para `domain/`.

---

## Fase 2 — Ritmo de Estudos

### T11 — Motor do Pomodoro (`pomodoro.js`) · P0 · ✅ Concluída
- **Depende de:** T02, T03
- **Objetivo:** máquina de estados com relógio injetável: foco 25 min → intervalo curto 5 min; a cada 4 focos, intervalo longo 15 min; após intervalo, estado `waiting`.
- **Critérios de aceitação:**
  - Tempo de foco acumulado baseado em timestamps; pausa não conta; intervalo não conta.
  - `finish()` retorna `{subjectId, startedAt, endedAt, focusSeconds, pomodorosCompleted}`.
  - Durações vêm de `config.js` (facilita teste).
  - Transições inválidas (ex.: `resume` sem estar pausado) são ignoradas sem erro.
- **Testes:** unitários com relógio falso: foco completo, pausa/retomada, finalizar no meio do foco, finalizar durante intervalo, ciclo longo após 4 focos, finalizar sem iniciar.

### T12 — Registro de sessões (`study-log.js`) · P0 · ✅ Concluída
- **Depende de:** T02, T11 (contrato de `session`)
- **Objetivo:** `save`, `byDay`, `totalsByDay`, `totalsByWeek`, `totalsBySubject`.
- **Critérios de aceitação:**
  - `focusSeconds == 0` não é salvo.
  - Totais diários preenchem com 0 os dias sem estudo no intervalo pedido.
  - Semana segunda–domingo; totais por matéria corretos.
- **Testes:** unitários com sessões fabricadas cruzando virada de semana e de mês; intervalo vazio.

### T13 — Tela do cronômetro · P0 · ✅ Concluída
- **Depende de:** T11, T12, T05
- **Objetivo:** `view-timer.js`: seleção da matéria, iniciar, pausar, retomar, finalizar; exibir fase atual, tempo restante, pomodoros concluídos; salvar sessão ao finalizar.
- **Critérios de aceitação:**
  - Não é possível iniciar sem matéria selecionada.
  - Fim do foco → intervalo automático com aviso visual e no `document.title`; fim do intervalo → aguarda clique.
  - Ao finalizar, mostra resumo (tempo real estudado) e a sessão aparece no histórico.
  - Sair da tela com o timer ativo não duplica intervalos (`destroy()` limpa o `setInterval`) e o timer continua consistente ao voltar.
  - Manter a aba em segundo plano por 1–2 min não altera o tempo registrado.
- **Testes:** manual: sessão curta (reduzir duração em `config.js` para teste), pausa longa, trocar de rota e voltar, aba em segundo plano. Conferir `focusSeconds` salvo.

### T14 — Histórico diário e semanal · P1 · ✅ Concluída
- **Depende de:** T12, T13
- **Objetivo:** `view-study-history.js`: total do dia, lista de sessões do dia (matéria, horário, duração), totais da semana atual por dia e por matéria; navegação por semana anterior/seguinte.
- **Critérios de aceitação:**
  - Valores conferem com as sessões salvas.
  - Dias sem estudo mostram 0 e não quebram a tela.
  - Estado vazio amigável.
- **Testes:** manual com dados de 2+ dias e 2+ semanas; conferir somatórios contra `localStorage`.

### T15 — Gráficos de evolução do estudo · P1 · ✅ Concluída
- **Depende de:** T14, T10 (reutiliza `charts.js`)
- **Objetivo:** adicionar `Charts.bars` e exibir: minutos por dia (últimos 7 dias), minutos por semana (últimas 4 semanas) e tempo por matéria.
- **Critérios de aceitação:**
  - Barras com rótulo de valor e eixo legível; escala adapta ao maior valor; todos os valores 0 não causam divisão por zero.
  - Cores por matéria diferenciáveis e com legenda textual.
  - Sem rolagem horizontal da página em 360px.
- **Testes:** manual com dados vazios, 1 dia, 7 dias, valores muito díspares.

### T16 — Integração Mapa → Ritmo (`priority.js`) · P1 · ✅ Concluída
- **Depende de:** T07, T12, T13, T09
- **Objetivo:** `Priority.suggest(grade)` e uso na home ("Estudar agora"), no seletor do timer (ordenado, pré-selecionado, selo da faixa), no resultado da avaliação e no histórico de estudo (tempo por matéria × faixa).
- **Critérios de aceitação:**
  - Ordem conforme regras da seção 6 de `ARCHITECTURE.md`.
  - Sem nenhuma avaliação: nenhuma matéria é "prioritária"; UI orienta a fazer o Mapa.
  - Botão "Estudar agora" abre o timer com a matéria sugerida selecionada, editável.
  - Cada sugestão exibe o motivo em linguagem simples.
- **Testes:** unitários de `priority` (sem avaliações, empates, estudo recente alterando o desempate, matéria sem avaliação ao final); manual do fluxo completo.

---

## Fase 3 — Robustez e entrega

### T17 — Home / painel inicial · P1 · ⏭ Dispensada no MVP simplificado
- **Depende de:** T09, T14, T16
- **Objetivo:** `view-home.js`: resumo do Mapa (faixas por matéria), tempo estudado hoje/semana, "Estudar agora", atalhos para as duas funcionalidades.
- **Critérios de aceitação:** funciona com dados vazios, parciais e completos; todos os atalhos navegam corretamente.
- **Testes:** manual nos três cenários de dados.

### T18 — Recuperação de sessão após recarga · P2 · ⏭ Dispensada no MVP simplificado
- **Depende de:** T13
- **Objetivo:** persistir `timer` com `lastHeartbeatAt` e restaurar em `paused`, creditando no máximo até o último heartbeat.
- **Critérios de aceitação:**
  - Recarregar com timer rodando restaura matéria e tempo acumulado em pausa e avisa o aluno.
  - Fechar o navegador por horas **não** credita as horas ausentes.
  - Dados de `timer` corrompidos são descartados sem erro.
- **Testes:** manual: recarregar durante foco, durante pausa e durante intervalo; unitário de restauração com relógio falso.

### T19 — Responsividade, acessibilidade e estados de erro · P2 · ✅ Concluída (escopo reduzido)
- **Depende de:** T17
- **Escopo aplicado:** revisão de responsividade, navegação, botões, estados vazios e fallback quando o `localStorage` está indisponível; sem novas funcionalidades.
- **Objetivo:** revisão transversal: 320/360/768/1280px, foco visível, ordem de tabulação, `aria-label` em gráficos, `aria-live` no timer sem excesso, contraste adequado, aviso quando `isPersistent()` é falso.
- **Critérios de aceitação:** nenhuma rolagem horizontal da página; todo fluxo concluível só com teclado; faixas distinguíveis sem cor; aviso de dados não persistentes exibido quando aplicável.
- **Testes:** checklist manual por tela; simular `localStorage` bloqueado.

### T20 — Verificação final de ponta a ponta · P2 · ✅ Concluída (MVP simplificado)
- **Depende de:** todas as anteriores
- **Escopo aplicado:** validação final do fluxo principal aprovado, em Chrome desktop e 360px, sem novas funcionalidades.
- **Objetivo:** executar o roteiro completo e corrigir apenas defeitos encontrados; limpar código morto.
- **Roteiro:** primeiro acesso → escolher série → avaliar as 4 matérias → conferir ranking → estudar a matéria prioritária → finalizar → ver histórico/gráficos → refazer avaliação → ver evolução → trocar de série → recarregar → abrir offline (sem rede).
- **Critérios de aceitação:** roteiro completo sem erro no console; `tests/runner.html` 100% ✔; nenhuma requisição de rede nas DevTools; funciona em Chrome e Firefox atuais.
- **Testes:** o próprio roteiro + runner + aba Network vazia.

---

## Grafo resumido de dependências

```
T01 ─┬─ T02 ─┬─ T07 ─┬─ T08 ─ T09 ─ T10
     │       │       │          └──────────┐
     ├─ T03 ─┼─ T04 ─┘                     │
     │       ├─ T11 ─ T12 ─ T13 ─ T14 ─ T15│
     │       └─ T05 ──────────────────────┐│
     └─ T06 ───────────────────── T08     ││
                                T16 (T07,T09,T12,T13) ─ T17 ─ T19 ─ T20
                                T18 (T13)
```

## Ordem sugerida de execução

T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → T09 → T10 → T11 → T12 → T13 → T14 → T15 → T16 → T17 → T18 → T19 → T20

> Pontos de demonstração: após **T09** o Mapa já é demonstrável; após **T13** o Ritmo já é demonstrável; após **T16** a integração está completa.
