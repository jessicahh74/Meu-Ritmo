(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};
  var registry = MeuRitmo.QuestionBanks;

  function freezeQuestion(question) {
    question.options = Object.freeze(question.options);
    return Object.freeze(question);
  }

  registry[2] = Object.freeze([
    {
      id: 'mat-2-01', grade: 2, subjectId: 'matematica', topic: 'Função exponencial', difficulty: 'easy',
      statement: 'Uma cultura de bactérias começa com 200 indivíduos e dobra a cada hora. Quantas bactérias haverá após 4 horas?',
      options: ['3.200', '800', '1.600', '6.400'],
      correctIndex: 0,
      explanation: 'O crescimento é 200 × 2⁴ = 200 × 16 = 3.200 bactérias.'
    },
    {
      id: 'mat-2-02', grade: 2, subjectId: 'matematica', topic: 'Logaritmos', difficulty: 'medium',
      statement: 'Qual é o valor de log₂ 32?',
      options: ['4', '5', '16', '30'],
      correctIndex: 1,
      explanation: 'O logaritmo procura o expoente: como 2⁵ = 32, então log₂ 32 = 5.'
    },
    {
      id: 'mat-2-03', grade: 2, subjectId: 'matematica', topic: 'Trigonometria', difficulty: 'medium',
      statement: 'Para um ângulo agudo θ, sabe-se que sen θ = 3/5. Usando a relação fundamental da trigonometria, qual é o valor de cos θ?',
      options: ['3/5', '5/4', '4/5', '2/5'],
      correctIndex: 2,
      explanation: 'Como sen² θ + cos² θ = 1, temos cos² θ = 1 - 9/25 = 16/25. Por θ ser agudo, cos θ = 4/5.'
    },
    {
      id: 'mat-2-04', grade: 2, subjectId: 'matematica', topic: 'Matrizes', difficulty: 'medium',
      statement: 'Dadas as matrizes A = [[1, 2], [3, 4]] e B = [[2, 0], [1, 5]], qual é o elemento da primeira linha e segunda coluna de A + B?',
      options: ['1', '5', '9', '2'],
      correctIndex: 3,
      explanation: 'A soma de matrizes é feita elemento a elemento; nessa posição, 2 + 0 = 2.'
    },
    {
      id: 'mat-2-05', grade: 2, subjectId: 'matematica', topic: 'Análise combinatória', difficulty: 'hard',
      statement: 'Quantos códigos diferentes de três letras podem ser formados com A, B, C e D, sem repetição, considerando que a ordem das letras diferencia os códigos?',
      options: ['24', '12', '18', '64'],
      correctIndex: 0,
      explanation: 'Há 4 escolhas para a primeira letra, 3 para a segunda e 2 para a terceira: 4 × 3 × 2 = 24.'
    },
    {
      id: 'por-2-01', grade: 2, subjectId: 'portugues', topic: 'Romantismo', difficulty: 'easy',
      statement: 'Qual característica é recorrente na primeira geração do Romantismo brasileiro?',
      options: ['Objetividade científica e determinismo', 'Nacionalismo e idealização do indígena', 'Linguagem exclusivamente documental', 'Crítica à industrialização futurista'],
      correctIndex: 1,
      explanation: 'A primeira geração romântica buscou símbolos nacionais e idealizou o indígena como herói brasileiro.'
    },
    {
      id: 'por-2-02', grade: 2, subjectId: 'portugues', topic: 'Realismo', difficulty: 'medium',
      statement: 'Em oposição à idealização romântica, a prosa realista brasileira costuma apresentar:',
      options: ['heróis sempre perfeitos e inalcançáveis', 'explicações baseadas apenas no sobrenatural', 'análise crítica das relações sociais e psicológicas', 'ausência de conflitos entre personagens'],
      correctIndex: 2,
      explanation: 'O Realismo observa criticamente comportamentos, interesses e contradições sociais, com atenção à psicologia das personagens.'
    },
    {
      id: 'por-2-03', grade: 2, subjectId: 'portugues', topic: 'Sintaxe', difficulty: 'medium',
      statement: 'Na oração “Chegaram cedo os novos estudantes”, qual é o sujeito?',
      options: ['oculto', 'cedo', 'indeterminado', 'os novos estudantes'],
      correctIndex: 3,
      explanation: '“Os novos estudantes” concorda com o verbo no plural e é sujeito posposto ao verbo.'
    },
    {
      id: 'por-2-04', grade: 2, subjectId: 'portugues', topic: 'Conjunções', difficulty: 'medium',
      statement: 'Em “Embora estivesse cansada, Luísa concluiu o relatório”, a conjunção “embora” estabelece ideia de:',
      options: ['concessão', 'causa', 'conclusão', 'condição'],
      correctIndex: 0,
      explanation: 'A concessão apresenta um fato que poderia impedir a ação principal, mas não a impede.'
    },
    {
      id: 'por-2-05', grade: 2, subjectId: 'portugues', topic: 'Argumentação', difficulty: 'hard',
      statement: 'Em um texto argumentativo, qual trecho apresenta uma tese?',
      options: ['Quinhentos estudantes responderam à pesquisa.', 'A leitura diária deve fazer parte da rotina escolar.', 'Duas novas turmas foram abertas pela escola.', 'O gráfico apresenta três colunas de cor azul.'],
      correctIndex: 1,
      explanation: 'A tese é uma posição defendida no texto; as outras alternativas apenas registram informações descritivas.'
    },
    {
      id: 'his-2-01', grade: 2, subjectId: 'historia', topic: 'Brasil colonial', difficulty: 'easy',
      statement: 'No sistema açucareiro do Brasil colonial, os engenhos se caracterizavam principalmente por:',
      options: ['pequena produção para consumo local', 'trabalho assalariado e policultura', 'latifúndio, monocultura e trabalho escravizado', 'produção industrial mecanizada'],
      correctIndex: 2,
      explanation: 'A produção açucareira colonial voltava-se à exportação e combinava grandes propriedades, monocultura e trabalho escravizado.'
    },
    {
      id: 'his-2-02', grade: 2, subjectId: 'historia', topic: 'Resistência à escravidão', difficulty: 'medium',
      statement: 'Os quilombos formados no Brasil escravista podem ser compreendidos como:',
      options: ['Postos de cobrança administrados pela Coroa', 'Aldeamentos controlados pelos colonizadores', 'Bases militares de defesa do território', 'Comunidades de resistência à escravidão'],
      correctIndex: 3,
      explanation: 'Quilombos reuniam principalmente pessoas escravizadas fugitivas e constituíam comunidades diversas de resistência e autonomia.'
    },
    {
      id: 'his-2-03', grade: 2, subjectId: 'historia', topic: 'Iluminismo', difficulty: 'medium',
      statement: 'Qual princípio político foi defendido por pensadores iluministas como Montesquieu?',
      options: ['Separação dos poderes do Estado', 'Poder absoluto concentrado no monarca', 'Retorno às relações feudais', 'Submissão das leis à vontade religiosa'],
      correctIndex: 0,
      explanation: 'Montesquieu propôs dividir o poder estatal para criar limites e evitar sua concentração em uma única autoridade.'
    },
    {
      id: 'his-2-04', grade: 2, subjectId: 'historia', topic: 'Revolução Francesa', difficulty: 'medium',
      statement: 'A Declaração dos Direitos do Homem e do Cidadão, de 1789, afirmava o princípio de:',
      options: ['soberania política exclusiva do monarca', 'igualdade dos cidadãos perante a lei', 'preservação dos privilégios de nascimento', 'representação política restrita ao clero'],
      correctIndex: 1,
      explanation: 'A declaração rejeitou privilégios de nascimento e afirmou direitos e igualdade jurídica, embora sua aplicação histórica tenha sido limitada.'
    },
    {
      id: 'his-2-05', grade: 2, subjectId: 'historia', topic: 'Independência do Brasil', difficulty: 'hard',
      statement: 'Qual fator contribuiu para o processo de independência do Brasil em 1822?',
      options: ['A abolição imediata da escravidão por Portugal', 'A implantação de uma república popular em Lisboa', 'A tentativa das Cortes portuguesas de recolonizar o Brasil', 'O fim do comércio entre Brasil e Inglaterra'],
      correctIndex: 2,
      explanation: 'As medidas centralizadoras das Cortes de Lisboa contrariaram grupos no Brasil e intensificaram a ruptura política com Portugal.'
    },
    {
      id: 'geo-2-01', grade: 2, subjectId: 'geografia', topic: 'Industrialização', difficulty: 'easy',
      statement: 'A desconcentração industrial brasileira ocorrida a partir do fim do século XX corresponde ao:',
      options: ['Fechamento das fábricas localizadas no Sudeste', 'Retorno da produção para oficinas artesanais', 'Fim das trocas industriais entre as regiões', 'Mudança de fábricas para novas regiões'],
      correctIndex: 3,
      explanation: 'Custos, incentivos e novas infraestruturas estimularam indústrias a buscar cidades e regiões fora dos núcleos tradicionais.'
    },
    {
      id: 'geo-2-02', grade: 2, subjectId: 'geografia', topic: 'Urbanização', difficulty: 'medium',
      statement: 'O crescimento urbano sem expansão proporcional de moradia e infraestrutura tende a produzir:',
      options: ['segregação socioespacial e ocupações precárias', 'redução automática da desigualdade', 'desaparecimento dos deslocamentos pendulares', 'distribuição uniforme dos serviços públicos'],
      correctIndex: 0,
      explanation: 'Quando a infraestrutura não acompanha o crescimento, grupos de menor renda são empurrados para áreas com menos serviços e maior risco.'
    },
    {
      id: 'geo-2-03', grade: 2, subjectId: 'geografia', topic: 'Demografia', difficulty: 'medium',
      statement: 'Uma queda prolongada das taxas de natalidade, combinada ao aumento da expectativa de vida, tende a causar:',
      options: ['rejuvenescimento imediato da população', 'envelhecimento da estrutura etária', 'aumento obrigatório da mortalidade infantil', 'equilíbrio permanente entre todas as faixas etárias'],
      correctIndex: 1,
      explanation: 'Menos nascimentos e maior longevidade aumentam proporcionalmente a participação de adultos idosos na população.'
    },
    {
      id: 'geo-2-04', grade: 2, subjectId: 'geografia', topic: 'Espaço agrário', difficulty: 'medium',
      statement: 'A concentração fundiária ocorre quando:',
      options: ['a propriedade da terra está distribuída de forma equilibrada', 'todas as propriedades produzem apenas alimentos', 'uma pequena parcela de proprietários controla grande parte das terras', 'as cidades deixam de depender do campo'],
      correctIndex: 2,
      explanation: 'Concentração fundiária significa que grandes extensões de terra ficam sob controle de poucos proprietários.'
    },
    {
      id: 'geo-2-05', grade: 2, subjectId: 'geografia', topic: 'Fontes de energia', difficulty: 'hard',
      statement: 'Qual fonte de energia é renovável, mas pode causar alagamento de grandes áreas e deslocamento de comunidades?',
      options: ['Carvão mineral', 'Petróleo', 'Gás natural', 'Hidrelétrica'],
      correctIndex: 3,
      explanation: 'A água é uma fonte renovável, mas grandes barragens alteram rios, ecossistemas e territórios ocupados.'
    }
  ].map(freezeQuestion));
}(window));
