# ARCHITECTURE.md — Meu Ritmo (MVP)

## 1. Visão geral

Aplicação web estática para alunos do Ensino Médio (1º, 2º e 3º ano) com duas funcionalidades integradas:

- **Mapa das Dificuldades**: questionário de 5 questões por matéria (Matemática, Português, História, Geografia), correção automática, classificação por cor, ranking, histórico e evolução.
- **Ritmo de Estudos**: Pomodoro com registro real do tempo estudado por matéria, histórico diário/semanal, gráficos e priorização baseada no Mapa.

**Restrições:** HTML5 + CSS3 + JS puro, sem frameworks/bibliotecas/APIs/backend, persistência em `localStorage`, sem nenhum recurso externo (fontes, CDN, imagens remotas) para funcionar offline após o carregamento.

**Princípio central:** regras de negócio em módulos puros (sem DOM, sem `localStorage` direto) → testáveis isoladamente; a UI só orquestra e renderiza.

## 2. Estrutura de arquivos

```
MEU RITMO/
├── index.html                  # casca única: header, nav, <main id="view">, scripts em ordem
├── css/
│   ├── base.css                # variáveis (cores das faixas, espaçamentos), reset, tipografia
│   ├── layout.css              # shell, navegação, grid, media queries
│   └── components.css          # cards, botões, timer, gráficos, tabelas
├── js/
│   ├── core/
│   │   ├── config.js           # cria namespace window.MeuRitmo; constantes (faixas, durações Pomodoro, chaves)
│   │   ├── utils.js            # ids, datas (dateKey, semana), formatação de tempo e %
│   │   ├── storage.js          # único acesso ao localStorage (leitura/escrita segura, versionada)
│   │   └── router.js           # roteador por hash (#/...) que funciona em file://
│   ├── data/
│   │   ├── subjects.js         # as 4 matérias (id, nome)
│   │   ├── questions-1ano.js   # 20 questões (4 matérias × 5)
│   │   ├── questions-2ano.js
│   │   └── questions-3ano.js
│   ├── domain/                 # lógica pura, sem DOM
│   │   ├── scoring.js          # correção, percentual, faixa de cor, ranking
│   │   ├── profile.js          # série do aluno
│   │   ├── assessments.js      # persistência/consulta de avaliações, evolução
│   │   ├── pomodoro.js         # máquina de estados do cronômetro (relógio injetável)
│   │   ├── study-log.js        # sessões de estudo e agregações diárias/semanais/por matéria
│   │   └── priority.js         # integra Mapa → Ritmo (matérias prioritárias)
│   ├── ui/                     # DOM; cada view expõe render(container, params) → destroy?()
│   │   ├── charts.js           # gráficos em SVG inline (linha e barras)
│   │   ├── view-home.js        # painel inicial + "Estudar agora"
│   │   ├── view-map.js         # Mapa: cartões por matéria + ranking
│   │   ├── view-quiz.js        # execução do questionário
│   │   ├── view-result.js      # resultado imediato da avaliação
│   │   ├── view-assessment-history.js  # histórico + comparação/evolução
│   │   ├── view-timer.js       # Pomodoro
│   │   └── view-study-history.js       # histórico diário/semanal + gráficos
│   └── app.js                  # bootstrap: perfil, rotas, header
└── tests/
    ├── runner.html             # abre no navegador, executa tudo e mostra ✔/✘
    ├── assert.js               # mini helper de asserção (sem libs)
    └── *.test.js               # testes dos módulos de domain/ e data/
```

**Scripts clássicos (não ES modules)**: módulos ES são bloqueados em `file://` por CORS no Chrome; como a apresentação provavelmente abrirá o `index.html` por duplo clique, usa-se `<script>` clássico com um único namespace global `MeuRitmo`, cada arquivo em IIFE. A ordem de carga em `index.html` é: `core → data → domain → ui → app.js`.

## 3. Responsabilidade dos módulos

| Módulo | Responsabilidade | Não deve |
|---|---|---|
| `config` | Namespace, constantes: faixas de cor, durações do Pomodoro, prefixo de chaves, versão do schema | Ter lógica |
| `utils` | `newId()`, `dateKey(ts)` (`YYYY-MM-DD` local), `weekKey(ts)` (semana seg–dom), `formatDuration(s)`, `formatPercent` | Acessar DOM/storage |
| `storage` | `get/set/remove` com `try/catch`, JSON seguro, fallback em memória se `localStorage` indisponível/corrompido, `isPersistent()` | Conhecer regras de negócio |
| `router` | Mapear hash → view, chamar `destroy()` da view anterior | Conhecer domínio |
| `subjects` | Lista fixa de matérias e lookup por id | — |
| `questions-*` | Dados puros do banco de questões | Lógica |
| `scoring` | `grade`, `bandFor`, `rank` (funções puras) | Persistir |
| `profile` | Ler/gravar série (1–3) | UI |
| `assessments` | Salvar avaliação, listar, última por matéria, série temporal por matéria | UI, calcular nota (usa `scoring`) |
| `pomodoro` | Estados, transições, tempo de foco acumulado real, eventos (`onTick`, `onPhaseChange`) | DOM, gravar histórico |
| `study-log` | Salvar sessão, agregações por dia/semana/matéria | Cronometrar |
| `priority` | Ordenar matérias para estudo a partir de avaliações + tempo estudado | UI |
| `ui/*` | Renderizar, capturar eventos, chamar domain | Regras de negócio, acessar `localStorage` |

## 4. Modelo de dados (localStorage)

Todas as chaves usam o prefixo `meuRitmo:v1:`. Um valor por chave, JSON.

**Identificadores:** `subjectId ∈ {"matematica","portugues","historia","geografia"}`; `grade ∈ {1,2,3}`; `band ∈ {"verde","amarelo","laranja","vermelho"}`; timestamps em ms (epoch); `dateKey` = `"YYYY-MM-DD"` no fuso local.

### `meuRitmo:v1:profile`
```
{ grade: 1|2|3, createdAt: ts, updatedAt: ts }
```

### `meuRitmo:v1:assessments` — array, mais antigo primeiro
```
{
  id: string,
  grade: 1|2|3,            // série vigente no momento da avaliação
  subjectId: string,
  takenAt: ts,
  total: 5,
  correct: 0..5,
  percent: 0|20|40|60|80|100,
  band: "verde"|"amarelo"|"laranja"|"vermelho",
  answers: [ { questionId: string, chosenIndex: int|null, isCorrect: bool } ]
}
```

### `meuRitmo:v1:sessions` — array, mais antigo primeiro
```
{
  id: string,
  subjectId: string,
  startedAt: ts,
  endedAt: ts,
  dateKey: string,          // dia de startedAt
  focusSeconds: int,        // somente tempo de foco ativo (pausas e intervalos NÃO contam)
  pomodorosCompleted: int   // blocos de foco concluídos integralmente
}
```

### `meuRitmo:v1:timer` — apenas enquanto há sessão em andamento (recuperação após recarregar)
```
{ subjectId, startedAt, phase: "focus"|"shortBreak"|"longBreak",
  status: "running"|"paused"|"waiting",
  phaseElapsedMs, focusAccumulatedMs, pomodorosCompleted,
  lastHeartbeatAt: ts }
```

### Banco de questões (código, não localStorage)
```
{ id: "mat-1-01", grade: 1, subjectId: "matematica",
  statement: string, options: [string × 4], correctIndex: 0..3, topic: string }
```
Contrato: exatamente 5 questões por `(grade, subjectId)`; ids únicos; `correctIndex` válido.

## 5. Contratos entre módulos

Assinaturas descritivas (nomes sugeridos; Codex pode ajustar desde que mantenha o contrato e informe no relatório).

- `Storage.get(key, fallback)` / `Storage.set(key, value)` / `Storage.remove(key)` / `Storage.isPersistent()`
- `Questions.get(grade, subjectId)` → array de 5 questões
- `Scoring.grade(questions, answersByQuestionId)` → `{ correct, total, percent, band, answers[] }`
- `Scoring.bandFor(percent)` → band (≥80 verde; ≥60 amarelo; ≥40 laranja; <40 vermelho)
- `Scoring.rank(latestBySubject)` → matérias ordenadas **do menor para o maior desempenho** (desempate: ordem fixa das matérias)
- `Assessments.save(result)` → registro salvo
- `Assessments.latestBySubject(grade)` → `{ [subjectId]: assessment | undefined }`
- `Assessments.history({grade?, subjectId?})` → lista, mais recente primeiro
- `Assessments.evolution(subjectId, grade)` → `[ {takenAt, percent, band} ]` cronológico, com `delta` em relação à anterior
- `Pomodoro.create({ clock, config })` → controlador com `start(subjectId)`, `pause()`, `resume()`, `startNextFocus()`, `finish()` → retorna `session` pronta para o log; `getSnapshot()`; `on('tick'|'phase'|'finish', cb)`
- `StudyLog.save(session)`; `StudyLog.byDay(dateKey)`; `StudyLog.totalsByDay(fromKey, toKey)`; `StudyLog.totalsByWeek(nWeeks)`; `StudyLog.totalsBySubject(fromKey, toKey)`
- `Priority.suggest(grade)` → `[ { subjectId, percent|null, band|null, studiedSecondsLast7d, reason } ]` ordenado por prioridade
- `Charts.line(container, series, opts)` / `Charts.bars(container, data, opts)` → SVG inline, sem libs

**Regras de dependência:** `ui → domain → core/data`. `domain` nunca importa `ui`. Só `storage` toca `localStorage`. Só `config` define constantes.

## 6. Integração entre as funcionalidades

A única ponte é `Priority`, que lê `Assessments.latestBySubject(grade)` e `StudyLog.totalsBySubject(últimos 7 dias)`.

Regras:
1. Matérias avaliadas ordenadas por menor `percent` primeiro.
2. Desempate: menos segundos estudados nos últimos 7 dias primeiro; persistindo, ordem fixa das matérias.
3. Matérias **sem avaliação** vão ao final com o motivo "Faça o questionário para descobrir seu nível".
4. `reason` explica a posição em linguagem simples (ex.: "Desempenho 40% (laranja) — pouco estudo esta semana").

Pontos de uso:
- **Home**: bloco "Estudar agora" com a 1ª prioridade e botão que abre o timer já com a matéria selecionada.
- **Timer**: lista de matérias ordenada por prioridade, selo da faixa de cor; a sugestão vem pré-selecionada, mas o aluno pode trocar.
- **Histórico de estudo**: tempo por matéria exibido junto da faixa de cor atual.
- Após uma avaliação, o resultado oferece "Estudar esta matéria agora".

## 7. Decisões arquiteturais

| # | Decisão | Motivo |
|---|---|---|
| D1 | Scripts clássicos + namespace único, sem ES modules | Funciona em `file://`; zero build |
| D2 | Roteamento por hash | Funciona em `file://` e sem servidor |
| D3 | Domínio puro separado da UI | Testável sem DOM; simples de revisar |
| D4 | Cronômetro baseado em timestamps (`Date.now()` com relógio injetável), `setInterval` só atualiza a tela | Aba em segundo plano é throttled; o tempo registrado tem de ser real |
| D5 | Após o intervalo terminar, o timer vai para `waiting` e exige clique para iniciar o próximo foco; fim do foco inicia o intervalo automaticamente | Evita creditar tempo "estudado" com o aluno ausente |
| D6 | Sessão é salva ao finalizar; `focusSeconds == 0` não é salvo; sessão é atribuída ao dia de início | Simplicidade; virada de meia-noite é limitação aceita |
| D7 | Gráficos em SVG inline gerado por JS | Sem libs; escala em qualquer tela; acessível |
| D8 | Cor nunca é o único sinal: toda faixa tem rótulo textual (Verde/Amarelo/Laranja/Vermelho) e ícone/padrão | Daltonismo e acessibilidade |
| D9 | Série escolhida uma vez (perfil), alterável; cada avaliação guarda a série | Questões diferem por série; evolução só compara avaliações da mesma série |
| D10 | "Ranking" = ordem do que mais precisa de atenção (menor % primeiro) | Serve ao objetivo de priorizar estudos — **confirmar com a product owner** |
| D11 | Renderização via `createElement`/`textContent`, evitar `innerHTML` com dados | Segurança e previsibilidade |
| D12 | Sem Service Worker | Exige http(s); como não há recursos externos, a página já funciona offline após carregada |
| D13 | Testes via `tests/runner.html` com helper próprio, apenas para `domain/` e `data/` | Testabilidade sem dependências |

## 8. Riscos e cuidados

**Técnicos**
- **R1 localStorage indisponível/cheio/corrompido** (modo privado, bloqueio): `storage` não pode lançar exceção; usar fallback em memória e exibir aviso "seus dados não serão salvos".
- **R2 Tempo falso ao recarregar/fechar a aba com timer rodando**: ao restaurar `timer`, creditar no máximo até `lastHeartbeatAt` e voltar em `paused`.
- **R3 Throttling de abas inativas**: mitigado por D4.
- **R4 Fuso/data**: usar sempre data local para `dateKey`; semana começa na segunda.
- **R5 Resposta correta exposta no código-fonte**: aceitável no MVP (sem backend); registrar como limitação.
- **R6 Estouro de escopo**: não adicionar login, exportação, notificações push, sons externos, Service Worker, PWA.
- **R7 Evolução de schema**: chaves versionadas `v1`; mudanças futuras exigem migração.

**Pedagógicos**
- **P1 Só 5 questões por matéria** → granularidade de 20 pontos percentuais e baixa confiabilidade. Comunicar na UI como "indicativo", não diagnóstico.
- **P2 Qualidade e adequação curricular das questões** (nível por série, ambiguidade, alternativas): o conteúdo deve ser **revisado por um professor** antes da apresentação.
- **P3 Repetição das mesmas questões** favorece memorização: embaralhar ordem das questões e das alternativas na apresentação (corrigir pelo `questionId`/índice original). Aviso de que refazer reaproveita as mesmas questões.
- **P4 Linguagem desmotivadora** (vermelho = "fraco"): usar textos encorajadores ("Precisa de mais atenção", "Em evolução").
- **P5 Comparação entre séries** é inválida; evolução e ranking só dentro da série atual.
- **P6 Tempo de tela ≠ aprendizado**: gráficos mostram tempo, não aprendizado — evitar mensagens que sugiram o contrário.
