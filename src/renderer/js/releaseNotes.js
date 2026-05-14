export const releaseNotes = [
  {
    version: "1.3.5",
    date: "2026-05-13",
    features: [
      "🌟 Padronização Visual Premium: As seções 'Foco Final' e 'Desenterrando da Fila' agora utilizam uma matriz quadrada 2x2 imersiva com cards customizados no estilo mini-banner.",
      "🎲 Interatividade no Backlog: Adicionado botão manual para rolar e sortear instantaneamente outra sugestão na Roleta do Destino.",
      "⚡ Experiência Fluida: Reset automático do temporizador do carrossel ao interagir manualmente nas abas."
    ],
    fixes: [
      "📅 Radar Preciso: Ajuste do fuso horário local para garantir que lançamentos e eventos do dia atual fiquem visíveis até a meia-noite.",
      "Formatação robusta no dia e mês dos eventos para maior compatibilidade regional."
    ]
  },
  {
    version: "1.3.3",
    date: "2026-05-08",
    features: [
      "🚀 Otimização de Tags: Seleção de gêneros agora é instantânea, sem atrasos ao clicar.",
      "⚡ Estabilidade: Refatoração interna do seletor para maior fluidez."
    ],
    fixes: [
      "Correção crítica: Resolvido erro de crash (tela preta) ao abrir o modal de gêneros."
    ]
  },
  {
    version: "1.3.2",
    date: "2026-05-08",
    features: [
      "🚀 Otimizações de Performance: UI muito mais fluida com memoização de componentes e aceleração de hardware (GPU).",
      "🔍 Busca Instantânea: Adicionado debounce no campo de busca para evitar travamentos ao digitar.",
      "⚡ Renderização Eficiente: Redução drástica de re-renders desnecessários na grade de jogos."
    ],
    fixes: [
      "Melhoria na suavidade das transições e animações de hover nos cards."
    ]
  },
  {
    version: "1.3.1",
    date: "2026-05-08",
    features: [],
    fixes: [
      "Correção crítica: As tags de gênero voltaram a aparecer nos cards e no modal de edição de jogos."
    ]
  },
  {
    version: "1.3.0",
    date: "2026-05-07",
    features: [
      "⚡ Integração HLTB Nativa: A busca de tempo de jogo agora usa binários compilados, eliminando a necessidade de instalar Python no computador.",
      "🚀 Performance Aprimorada: Respostas mais rápidas e estáveis na busca de dados do HowLongToBeat.",
      "💻 Suporte Multiplataforma: Executáveis otimizados incluídos nativamente para Windows e Linux.",
      "📦 Distribuição Simplificada: O instalador agora contém todos os recursos necessários para o funcionamento imediato."
    ],
    fixes: [
      "Correção de dependências de sistema ao realizar buscas de metadados.",
      "Melhoria na detecção de ambiente (Dev vs Produção) para recursos externos."
    ]
  },
  {
    version: "1.2.0",
    date: "2026-05-04",
    features: [
      "🔥 Dashboard de Estatísticas: Uma visão completa da sua biblioteca com gráficos de status, gêneros e tempo total jogado.",
      "🧠 Coleções Inteligentes: Agrupamento automático de jogos (Para Terminar, Obras-Primas, Prioridade Backlog).",
      "🎨 Gêneros Coloridos: Mais de 50 gêneros predefinidos com cores exclusivas para facilitar a identificação visual.",
      "🖼️ Banners Cinematográficos: Adicione imagens de fundo (banners) para uma experiência visual premium no modal de detalhes.",
      "📁 Menu Lateral Organizável: Seções expansíveis e colapsáveis para manter sua navegação limpa e elegante.",
      "📅 Calendário em Destaque: Acesso rápido e fixo ao calendário no topo do menu lateral.",
      "🔍 Filtro por Gênero: Agora você pode filtrar sua biblioteca inteira por categorias específicas."
    ],
    fixes: [
      "Correção de erro de sintaxe que causava tela preta no cadastro de jogos.",
      "Melhoria na persistência de gêneros e sincronização com o banco de dados.",
      "Ajuste na responsividade do modal de detalhes para telas menores."
    ]
  },
  {
    version: "1.1.0",
    date: "2026-05-03",
    features: [
      "Sistema de Gêneros e Tags: Agora você pode classificar seus jogos por categorias.",
      "Múltiplas Tags: Adicione quantos gêneros quiser a um único jogo.",
      "Tags Predefinidas: Comece com os principais gêneros populares já disponíveis.",
      "Gerenciamento Dinâmico: Crie novas tags personalizadas diretamente no formulário do jogo.",
      "Visualização Aprimorada: Veja as tags nos cards da biblioteca e nos detalhes do jogo."
    ],
    fixes: []
  },
  {
    version: "1.0.0",
    date: "2026-05-01",
    features: [
      "Lançamento inicial do Checkpoint Desktop.",
      "Gerenciamento de biblioteca de jogos com SQLite.",
      "Visualização de calendário para eventos e lançamentos.",
      "Sistema de backup e importação de dados.",
      "Temas customizáveis e modo escuro/claro."
    ],
    fixes: []
  }
];
