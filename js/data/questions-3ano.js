(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};
  var registry = MeuRitmo.QuestionBanks;

  function freezeQuestion(question) {
    question.options = Object.freeze(question.options);
    return Object.freeze(question);
  }

  registry[3] = Object.freeze([
    {
      id: 'mat-3-01', grade: 3, subjectId: 'matematica', topic: 'Probabilidade', difficulty: 'easy',
      statement: 'Uma urna contém 3 bolas azuis e 2 vermelhas. Ao retirar uma bola ao acaso, qual é a probabilidade de ela ser azul?',
      options: ['3/5', '2/5', '1/2', '3/2'],
      correctIndex: 0,
      explanation: 'Há 3 resultados favoráveis entre 5 bolas possíveis, portanto a probabilidade é 3/5.'
    },
    {
      id: 'mat-3-02', grade: 3, subjectId: 'matematica', topic: 'Estatística', difficulty: 'medium',
      statement: 'Qual é a mediana do conjunto de valores 2, 4, 7, 9 e 15?',
      options: ['4', '7', '7,4', '9'],
      correctIndex: 1,
      explanation: 'Com cinco valores ordenados, a mediana é o terceiro elemento, que vale 7.'
    },
    {
      id: 'mat-3-03', grade: 3, subjectId: 'matematica', topic: 'Geometria analítica', difficulty: 'medium',
      statement: 'Qual é o coeficiente angular da reta que passa pelos pontos (1, 2) e (4, 8)?',
      options: ['1/2', '3', '2', '6'],
      correctIndex: 2,
      explanation: 'O coeficiente angular é (8 - 2) ÷ (4 - 1) = 6 ÷ 3 = 2.'
    },
    {
      id: 'mat-3-04', grade: 3, subjectId: 'matematica', topic: 'Matemática financeira', difficulty: 'medium',
      statement: 'Um capital de R$ 1.000,00 é aplicado a juros compostos de 10% ao mês por 2 meses. Qual é o montante?',
      options: ['R$ 1.100,00', 'R$ 1.200,00', 'R$ 1.220,00', 'R$ 1.210,00'],
      correctIndex: 3,
      explanation: 'Nos juros compostos, M = 1.000 × 1,1² = 1.000 × 1,21 = R$ 1.210,00.'
    },
    {
      id: 'mat-3-05', grade: 3, subjectId: 'matematica', topic: 'Geometria espacial', difficulty: 'hard',
      statement: 'Qual é o volume de um cilindro de raio 3 cm e altura 10 cm?',
      options: ['90π cm³', '30π cm³', '60π cm³', '180π cm³'],
      correctIndex: 0,
      explanation: 'O volume é V = πr²h = π × 3² × 10 = 90π cm³.'
    },
    {
      id: 'por-3-01', grade: 3, subjectId: 'portugues', topic: 'Modernismo', difficulty: 'easy',
      statement: 'Uma proposta marcante da primeira fase do Modernismo brasileiro foi:',
      options: ['repetir rigidamente os modelos clássicos europeus', 'buscar linguagem experimental e temas ligados ao Brasil', 'eliminar marcas da oralidade da literatura', 'retomar exclusivamente a estética medieval'],
      correctIndex: 1,
      explanation: 'Os modernistas de 1922 questionaram convenções acadêmicas e experimentaram formas e linguagens associadas à realidade brasileira.'
    },
    {
      id: 'por-3-02', grade: 3, subjectId: 'portugues', topic: 'Concordância verbal', difficulty: 'medium',
      statement: 'Qual frase está de acordo com a norma-padrão de concordância verbal?',
      options: ['Fazem dois anos que estudo aqui.', 'Houveram muitos debates ontem.', 'Existem boas razões para revisar o texto.', 'Deve haverem novas oportunidades.'],
      correctIndex: 2,
      explanation: 'Em “existem boas razões”, o verbo existir concorda com o sujeito plural; fazer e haver, nesses usos, são impessoais.'
    },
    {
      id: 'por-3-03', grade: 3, subjectId: 'portugues', topic: 'Crase', difficulty: 'medium',
      statement: 'Em qual frase o uso do acento indicativo de crase está correto?',
      options: ['Cheguei à pé cedo.', 'Visitei à Recife no verão.', 'Começou à chover ontem.', 'Entreguei o livro à professora.'],
      correctIndex: 3,
      explanation: 'O verbo entregar exige a preposição “a”, que se une ao artigo feminino de “a professora”: a + a = à.'
    },
    {
      id: 'por-3-04', grade: 3, subjectId: 'portugues', topic: 'Leitura argumentativa', difficulty: 'medium',
      statement: 'Um texto afirma: “A biblioteca ampliou o horário e, no mês seguinte, os empréstimos cresceram 30%”. Esse dado é usado principalmente para:',
      options: ['sustentar uma relação entre acesso e número de empréstimos', 'apresentar uma definição de biblioteca', 'descrever a aparência dos livros', 'questionar a existência de leitores'],
      correctIndex: 0,
      explanation: 'A sequência dos fatos e o percentual funcionam como evidência para associar a ampliação do acesso ao aumento dos empréstimos.'
    },
    {
      id: 'por-3-05', grade: 3, subjectId: 'portugues', topic: 'Intertextualidade', difficulty: 'hard',
      statement: 'Quando uma campanha publicitária recria um verso conhecido para produzir novo sentido, ela utiliza:',
      options: ['metalinguagem', 'intertextualidade', 'polissemia', 'coesão referencial'],
      correctIndex: 1,
      explanation: 'A intertextualidade ocorre quando um texto dialoga com outro por citação, alusão, paródia ou recriação.'
    },
    {
      id: 'his-3-01', grade: 3, subjectId: 'historia', topic: 'Primeira República', difficulty: 'easy',
      statement: 'Na Primeira República brasileira, a chamada política dos governadores baseava-se na:',
      options: ['eleição direta de todos os cargos públicos', 'proibição da influência dos coronéis', 'aliança entre governo federal e oligarquias estaduais', 'participação universal e secreta dos eleitores'],
      correctIndex: 2,
      explanation: 'O governo federal apoiava grupos estaduais dominantes, que em troca garantiam bases políticas por redes locais de poder.'
    },
    {
      id: 'his-3-02', grade: 3, subjectId: 'historia', topic: 'Era Vargas', difficulty: 'medium',
      statement: 'A Consolidação das Leis do Trabalho, criada em 1943 durante o governo Vargas, teve como objetivo:',
      options: ['abolir toda forma de organização sindical', 'eliminar o salário mínimo', 'transferir as leis trabalhistas aos governos municipais', 'reunir e regulamentar direitos e relações de trabalho urbano'],
      correctIndex: 3,
      explanation: 'A CLT sistematizou normas trabalhistas, embora o Estado também mantivesse forte controle sobre a organização sindical.'
    },
    {
      id: 'his-3-03', grade: 3, subjectId: 'historia', topic: 'Segunda Guerra Mundial', difficulty: 'medium',
      statement: 'O Dia D, em junho de 1944, foi importante para a Segunda Guerra Mundial porque marcou:',
      options: ['o desembarque aliado na Normandia', 'o ataque japonês à base de Pearl Harbor', 'a rendição alemã na frente oriental', 'a criação da Organização das Nações Unidas'],
      correctIndex: 0,
      explanation: 'O desembarque na Normandia permitiu o avanço aliado pela Europa Ocidental contra as forças nazistas.'
    },
    {
      id: 'his-3-04', grade: 3, subjectId: 'historia', topic: 'Ditadura civil-militar', difficulty: 'medium',
      statement: 'O Ato Institucional nº 5, decretado em 1968 no Brasil, ampliou:',
      options: ['as garantias de liberdade de expressão', 'a repressão política e os poderes do Executivo', 'a autonomia irrestrita do Congresso', 'as eleições diretas para presidente'],
      correctIndex: 1,
      explanation: 'O AI-5 aprofundou o autoritarismo, permitindo medidas como fechamento do Congresso, cassações e suspensão de garantias.'
    },
    {
      id: 'his-3-05', grade: 3, subjectId: 'historia', topic: 'Redemocratização', difficulty: 'hard',
      statement: 'A Constituição brasileira de 1988 ficou conhecida como “Constituição Cidadã” por:',
      options: ['concentrar atribuições políticas no Executivo', 'manter eleições presidenciais apenas indiretas', 'restabelecer e ampliar direitos civis, políticos e sociais', 'limitar a liberdade de organização sindical'],
      correctIndex: 2,
      explanation: 'Produzida após a ditadura, a Constituição de 1988 consolidou instituições democráticas e ampliou direitos sociais e individuais.'
    },
    {
      id: 'geo-3-01', grade: 3, subjectId: 'geografia', topic: 'Geopolítica', difficulty: 'easy',
      statement: 'A expressão “mundo multipolar” descreve uma ordem internacional caracterizada por:',
      options: ['um único país concentrando todo o poder', 'ausência de relações entre os Estados', 'fim das organizações internacionais', 'vários centros relevantes de poder econômico e político'],
      correctIndex: 3,
      explanation: 'Na multipolaridade, diferentes países ou blocos exercem influência, sem que todo o poder se concentre em um único polo.'
    },
    {
      id: 'geo-3-02', grade: 3, subjectId: 'geografia', topic: 'Blocos econômicos', difficulty: 'medium',
      statement: 'Uma união aduaneira se diferencia de uma zona de livre comércio porque adota:',
      options: ['uma tarifa externa comum', 'uma moeda única obrigatória', 'a eliminação das fronteiras políticas', 'um governo único para os países membros'],
      correctIndex: 0,
      explanation: 'Além de reduzir barreiras internas, a união aduaneira estabelece uma política tarifária comum diante de países externos.'
    },
    {
      id: 'geo-3-03', grade: 3, subjectId: 'geografia', topic: 'Migrações internacionais', difficulty: 'medium',
      statement: 'Segundo o uso internacional do termo, uma pessoa refugiada deixa seu país principalmente por:',
      options: ['busca voluntária por melhores salários', 'perseguição ou grave ameaça a seus direitos', 'participação temporária em intercâmbio', 'reunião familiar planejada sem coerção'],
      correctIndex: 1,
      explanation: 'O refúgio envolve deslocamento forçado ligado a perseguições, conflitos ou violações graves, diferentemente de uma viagem voluntária.'
    },
    {
      id: 'geo-3-04', grade: 3, subjectId: 'geografia', topic: 'Mudanças climáticas', difficulty: 'medium',
      statement: 'Qual atividade humana contribui diretamente para intensificar o efeito estufa?',
      options: ['Substituição do carvão por energia solar', 'Reflorestamento de áreas degradadas', 'Queima de combustíveis fósseis', 'Aumento da eficiência energética'],
      correctIndex: 2,
      explanation: 'A queima de carvão, petróleo e gás libera dióxido de carbono, aumentando a concentração de gases de efeito estufa.'
    },
    {
      id: 'geo-3-05', grade: 3, subjectId: 'geografia', topic: 'Rede urbana', difficulty: 'hard',
      statement: 'Na rede urbana, uma metrópole se distingue por:',
      options: ['concentrar apenas atividades agrícolas locais', 'manter poucos fluxos com cidades vizinhas', 'apresentar sempre a maior população nacional', 'articular serviços e fluxos de ampla região'],
      correctIndex: 3,
      explanation: 'Metrópoles concentram funções de gestão, serviços especializados e conexões que organizam fluxos em escalas amplas.'
    }
  ].map(freezeQuestion));

  Object.freeze(registry);
}(window));
