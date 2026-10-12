(function (global) {
  'use strict';

  var MeuRitmo = global.MeuRitmo = global.MeuRitmo || {};
  var registry = MeuRitmo.QuestionBanks = MeuRitmo.QuestionBanks || {};

  function freezeQuestion(question) {
    question.options = Object.freeze(question.options);
    return Object.freeze(question);
  }

  registry[1] = Object.freeze([
    {
      id: 'mat-1-01', grade: 1, subjectId: 'matematica', topic: 'Função afim', difficulty: 'medium',
      statement: 'Uma corrida de táxi custa R$ 6,00 de bandeirada mais R$ 2,50 por quilômetro percorrido. Qual expressão representa o preço P de uma corrida de x quilômetros?',
      options: ['P(x) = 6 + 2,5x', 'P(x) = 2,5 + 6x', 'P(x) = 8,5x', 'P(x) = 6 - 2,5x'],
      correctIndex: 0,
      explanation: 'A bandeirada é a parcela fixa 6, enquanto 2,5 multiplica a quantidade variável de quilômetros.'
    },
    {
      id: 'mat-1-02', grade: 1, subjectId: 'matematica', topic: 'Equação do segundo grau', difficulty: 'medium',
      statement: 'Quais são as raízes reais da equação x² - 5x + 6 = 0?',
      options: ['1 e 6', '2 e 3', '-2 e -3', '0 e 5'],
      correctIndex: 1,
      explanation: 'A expressão pode ser fatorada como (x - 2)(x - 3), portanto as raízes são 2 e 3.'
    },
    {
      id: 'mat-1-03', grade: 1, subjectId: 'matematica', topic: 'Progressão aritmética', difficulty: 'hard',
      statement: 'Na progressão aritmética (4, 7, 10, 13, ...), qual é o décimo termo?',
      options: ['28', '34', '31', '37'],
      correctIndex: 2,
      explanation: 'Usando aₙ = a₁ + (n - 1)r, temos a₁₀ = 4 + 9 × 3 = 31.'
    },
    {
      id: 'mat-1-04', grade: 1, subjectId: 'matematica', topic: 'Geometria plana', difficulty: 'easy',
      statement: 'Um triângulo tem base de 12 cm e altura relativa a essa base de 5 cm. Qual é sua área?',
      options: ['17 cm²', '60 cm²', '120 cm²', '30 cm²'],
      correctIndex: 3,
      explanation: 'A área do triângulo é base × altura ÷ 2: 12 × 5 ÷ 2 = 30 cm².'
    },
    {
      id: 'mat-1-05', grade: 1, subjectId: 'matematica', topic: 'Porcentagem', difficulty: 'medium',
      statement: 'Uma mochila de R$ 200,00 recebeu desconto de 15%. Qual é o preço após o desconto?',
      options: ['R$ 170,00', 'R$ 150,00', 'R$ 175,00', 'R$ 185,00'],
      correctIndex: 0,
      explanation: 'Quinze por cento de 200 é 30; subtraindo o desconto, o preço fica em R$ 170,00.'
    },
    {
      id: 'por-1-01', grade: 1, subjectId: 'portugues', topic: 'Variação linguística', difficulty: 'easy',
      statement: 'Em uma entrevista de emprego formal, qual frase está mais adequada à situação comunicativa?',
      options: ['Queria falar dos trabalhos que já fiz, beleza?', 'Desejo apresentar minha experiência profissional.', 'Acho que mando bem nesse tipo de trampo.', 'Tô querendo começar nesse serviço logo.'],
      correctIndex: 1,
      explanation: 'Situações formais pedem vocabulário e construção compatíveis com a norma-padrão, sem desvalorizar outras variedades linguísticas.'
    },
    {
      id: 'por-1-02', grade: 1, subjectId: 'portugues', topic: 'Conotação', difficulty: 'medium',
      statement: 'Na frase “Depois da notícia, ele ficou com o coração de pedra”, a expressão entre aspas — “coração de pedra” — indica que a pessoa ficou:',
      options: ['fisicamente doente', 'com o coração pesado', 'insensível aos sentimentos', 'imóvel por alguns minutos'],
      correctIndex: 2,
      explanation: '“Coração de pedra” tem sentido conotativo e caracteriza alguém que demonstra insensibilidade.'
    },
    {
      id: 'por-1-03', grade: 1, subjectId: 'portugues', topic: 'Gêneros textuais', difficulty: 'medium',
      statement: 'Qual característica distingue uma notícia jornalística de um artigo de opinião?',
      options: ['A notícia apresenta instruções em etapas sucessivas.', 'A notícia desenvolve personagens em uma narrativa ficcional.', 'A notícia defende explicitamente uma tese do autor.', 'A notícia prioriza relatar fatos verificáveis.'],
      correctIndex: 3,
      explanation: 'A notícia busca informar sobre fatos; o artigo de opinião defende uma posição por meio de argumentos.'
    },
    {
      id: 'por-1-04', grade: 1, subjectId: 'portugues', topic: 'Coesão referencial', difficulty: 'medium',
      statement: 'Em “Marina entregou o trabalho a Paula porque ela havia solicitado o documento”, qual problema prejudica a clareza?',
      options: ['Ambiguidade do pronome “ela”', 'Ausência de verbo principal', 'Uso incorreto de pontuação final', 'Falta de concordância nominal'],
      correctIndex: 0,
      explanation: 'O pronome “ela” pode retomar Marina ou Paula, tornando incerto quem solicitou o documento.'
    },
    {
      id: 'por-1-05', grade: 1, subjectId: 'portugues', topic: 'Figuras de linguagem', difficulty: 'hard',
      statement: 'Em “A cidade acordou nervosa com o barulho das sirenes”, qual figura de linguagem atribui ação humana à cidade?',
      options: ['Antítese', 'Personificação', 'Eufemismo', 'Hipérbole'],
      correctIndex: 1,
      explanation: 'A personificação atribui características ou ações humanas a seres não humanos, como a cidade que “acorda”.'
    },
    {
      id: 'his-1-01', grade: 1, subjectId: 'historia', topic: 'Grécia Antiga', difficulty: 'easy',
      statement: 'Na democracia ateniense do século V a.C., quem podia participar diretamente das decisões políticas?',
      options: ['Todos os habitantes de Atenas', 'Apenas sacerdotes e militares', 'Cidadãos homens, adultos e livres', 'Mulheres livres e estrangeiros residentes'],
      correctIndex: 2,
      explanation: 'A cidadania ateniense era restrita a homens adultos e livres considerados cidadãos; mulheres, escravizados e estrangeiros eram excluídos.'
    },
    {
      id: 'his-1-02', grade: 1, subjectId: 'historia', topic: 'Feudalismo', difficulty: 'medium',
      statement: 'Qual relação caracterizou grande parte do trabalho nos feudos medievais europeus?',
      options: ['Trabalho assalariado nas manufaturas', 'Escravidão concentrada nas cidades', 'Trabalho livre em pequenas propriedades', 'Servidão com obrigações ao senhor'],
      correctIndex: 3,
      explanation: 'Os servos cultivavam terras e cumpriam obrigações, como tributos e trabalho, em troca de proteção e acesso à terra.'
    },
    {
      id: 'his-1-03', grade: 1, subjectId: 'historia', topic: 'Renascimento', difficulty: 'medium',
      statement: 'O humanismo renascentista europeu valorizou principalmente:',
      options: ['a investigação sobre o ser humano e a natureza', 'a rejeição completa da cultura clássica', 'o fim de toda produção artística religiosa', 'a proibição da observação científica'],
      correctIndex: 0,
      explanation: 'O humanismo retomou referências greco-romanas e valorizou a razão, a experiência e as capacidades humanas.'
    },
    {
      id: 'his-1-04', grade: 1, subjectId: 'historia', topic: 'Reforma Protestante', difficulty: 'medium',
      statement: 'Uma crítica apresentada por Martinho Lutero no início da Reforma Protestante foi dirigida à:',
      options: ['tradução de textos religiosos', 'venda de indulgências pela Igreja', 'existência de universidades', 'circulação de livros impressos'],
      correctIndex: 1,
      explanation: 'Lutero criticou práticas como a venda de indulgências e defendeu que a salvação dependia da fé.'
    },
    {
      id: 'his-1-05', grade: 1, subjectId: 'historia', topic: 'Mercantilismo', difficulty: 'hard',
      statement: 'Qual prática estava associada às políticas mercantilistas dos Estados europeus modernos?',
      options: ['Livre-comércio e redução das tarifas', 'Baixa intervenção do Estado na economia', 'Protecionismo e busca por metais preciosos', 'Divisão igualitária das terras coloniais'],
      correctIndex: 2,
      explanation: 'O mercantilismo envolvia forte ação estatal, protecionismo e busca de saldo comercial favorável e metais preciosos.'
    },
    {
      id: 'geo-1-01', grade: 1, subjectId: 'geografia', topic: 'Cartografia', difficulty: 'easy',
      statement: 'Em um mapa de escala 1:100.000, uma distância de 3 cm representa qual distância real?',
      options: ['300 m', '30 km', '300 km', '3 km'],
      correctIndex: 3,
      explanation: 'Na escala 1:100.000, 1 cm representa 100.000 cm, ou 1 km; portanto, 3 cm representam 3 km.'
    },
    {
      id: 'geo-1-02', grade: 1, subjectId: 'geografia', topic: 'Coordenadas geográficas', difficulty: 'medium',
      statement: 'A latitude de um ponto indica sua distância angular em relação:',
      options: ['à Linha do Equador', 'ao Meridiano de Greenwich', 'ao nível médio do mar', 'ao Trópico de Capricórnio'],
      correctIndex: 0,
      explanation: 'A latitude é medida ao norte ou ao sul da Linha do Equador; a longitude usa Greenwich como referência.'
    },
    {
      id: 'geo-1-03', grade: 1, subjectId: 'geografia', topic: 'Tectônica de placas', difficulty: 'medium',
      statement: 'A ocorrência frequente de terremotos nos limites entre placas tectônicas se explica principalmente pelo:',
      options: ['aumento diário da temperatura solar', 'movimento e acúmulo de tensão entre as placas', 'deslocamento das massas de ar', 'crescimento da vegetação sobre as rochas'],
      correctIndex: 1,
      explanation: 'O movimento das placas acumula tensão nas rochas; sua liberação repentina produz ondas sísmicas.'
    },
    {
      id: 'geo-1-04', grade: 1, subjectId: 'geografia', topic: 'Climatologia', difficulty: 'medium',
      statement: 'Por que áreas de maior altitude tendem a apresentar temperaturas mais baixas?',
      options: ['Porque recebem sempre menos luz solar', 'Porque estão necessariamente mais próximas dos polos', 'Porque a pressão diminui e o ar se resfria ao se expandir', 'Porque possuem maior concentração de gases do efeito estufa'],
      correctIndex: 2,
      explanation: 'Com o aumento da altitude, a pressão atmosférica diminui; o ar ascendente se expande e perde temperatura.'
    },
    {
      id: 'geo-1-05', grade: 1, subjectId: 'geografia', topic: 'Globalização', difficulty: 'hard',
      statement: 'Qual fenômeno caracteriza a globalização contemporânea?',
      options: ['Autossuficiência produtiva de cada país', 'Redução dos fluxos migratórios internacionais', 'Uniformização das condições de trabalho mundiais', 'Integração de mercados e redes de comunicação'],
      correctIndex: 3,
      explanation: 'A globalização amplia conexões econômicas, produtivas e informacionais, embora seus efeitos sejam desiguais.'
    }
  ].map(freezeQuestion));

  MeuRitmo.Questions = Object.freeze({
    get: function (grade, subjectId) {
      var bank = registry[grade];
      if (!bank || !MeuRitmo.Subjects.getById(subjectId)) {
        return [];
      }
      return bank.filter(function (question) {
        return question.subjectId === subjectId;
      });
    }
  });
}(window));
