import { Automation } from "../types";

export const automationsCatalog: Automation[] = [
  {
    id: "wppconnect-analyzer",
    title: "Resumo Diário - WhatsApp",
    description: "Lê conversas recentes não lidas, analisa com Gemini e envia um resumo diretamente no seu WhatsApp nos horários pré-definidos (8h, 12h, 17h, 22h). Funciona com qualquer API de WhatsApp na Nuvem.",
    icon: "MessageSquareText",
    category: "productivity",
    executionType: "scheduled",
    scheduleDetails: "Rodará automaticamente todos os dias às 08:00, 12:00, 17:00 e 22:00",
    systemInstruction: "Você é um assistente pessoal. Daremos um JSON contendo as mensagens recentes. Identifique quais conversas requerem atenção urgente e faça um resumo executivo para o usuário ler.\nFormate a mensagem adequadamente para o WhatsApp.",
    fields: [
      {
        name: "wppApiUrl",
        label: "URL da API Online (Z-API, MegaAPI, etc)",
        type: "text",
        placeholder: "Ex: https://api.z-api.io/instances/SUA_INSTANCIA",
        required: true,
      },
      {
        name: "token",
        label: "Token de Segurança (Client Token)",
        type: "text",
        placeholder: "Seu Client-Token do provedor",
        required: true,
      },
      {
        name: "targetNumber",
        label: "Seu Número para receber resumos (com DDI)",
        type: "text",
        placeholder: "Ex: 5511999999999",
        required: true,
      }
    ]
  },
  {
    id: "text-summary",
    title: "Resumo de Texto",
    description: "Crie resumos concisos e diretos de textos longos ou artigos.",
    icon: "FileText",
    category: "productivity",
    executionType: "manual",
    systemInstruction: "Você é um assistente especialista em resumir textos. Extraia os pontos principais e a conclusão do texto fornecido. Formate a saída em Markdown usando bullet points.",
    fields: [
      {
        name: "text",
        label: "Texto Original",
        type: "textarea",
        placeholder: "Cole o texto que deseja resumir aqui...",
        required: true,
      }
    ]
  },
  {
    id: "social-post",
    title: "Gerador de Posts",
    description: "Crie posts engajadores para LinkedIn, Instagram ou Twitter.",
    icon: "MessageSquareText",
    category: "marketing",
    systemInstruction: "Você é um social media expert. Crie um post para a rede social solicitada usando o tema fornecido. Inclua emojis relevantes e hashtags no final. Certifique-se de que o tom seja adequado à rede escolhida.",
    fields: [
      {
        name: "platform",
        label: "Rede Social",
        type: "select",
        options: [
          { label: "LinkedIn", value: "LinkedIn" },
          { label: "Instagram", value: "Instagram" },
          { label: "Twitter / X", value: "Twitter" }
        ],
        required: true,
      },
      {
        name: "topic",
        label: "Assunto / Tema do Post",
        type: "textarea",
        placeholder: "Sobre o que você quer falar?",
        required: true,
      },
      {
        name: "tone",
        label: "Tom de Voz",
        type: "select",
        options: [
          { label: "Profissional", value: "Profissional" },
          { label: "Casual", value: "Casual" },
          { label: "Inspirador", value: "Inspirador" },
          { label: "Humorístico", value: "Humorístico" }
        ],
        required: true,
      }
    ]
  },
  {
    id: "code-reviewer",
    title: "Analisador de Código",
    description: "Revisa seu código em busca de bugs, melhorias de performance e boas práticas.",
    icon: "Code2",
    category: "development",
    systemInstruction: "Você é um Desenvolvedor Sênior. Analise o código fornecido. Identifique bugs em potencial, sugira melhorias de performance, e dê dicas de clean code. Formate sua resposta em Markdown, utilizando blocos de código para exemplos.",
    fields: [
      {
        name: "language",
        label: "Linguagem de Programação",
        type: "text",
        placeholder: "Ex: TypeScript, Python...",
        required: true,
      },
      {
        name: "code",
        label: "Código Fonte",
        type: "textarea",
        placeholder: "Cole seu código aqui...",
        required: true,
      }
    ]
  },
  {
    id: "sales-email",
    title: "E-mail de Vendas B2B",
    description: "Gere e-mails de prospecção (cold email) altamente persuasivos.",
    icon: "Mail",
    category: "marketing",
    systemInstruction: "Você é um copywriter especialista em vendas B2B. Escreva um cold email persuasivo usando frameworks como AIDA ou PAS. Mantenha o email conciso, focado no problema do cliente e com um Call to Action claro.",
    fields: [
      {
        name: "product",
        label: "Seu Produto/Serviço",
        type: "text",
        placeholder: "O que você está vendendo?",
        required: true,
      },
      {
        name: "target",
        label: "Público-Alvo",
        type: "text",
        placeholder: "Para quem é o e-mail? (Ex: Diretores de RH)",
        required: true,
      },
      {
        name: "pain_point",
        label: "Dor Principal",
        type: "text",
        placeholder: "Qual problema seu produto resolve?",
        required: true,
      }
    ]
  }
];
