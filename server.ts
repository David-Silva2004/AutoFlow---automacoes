import express from "express";
import { createServer as createViteServer } from "vite";
import cron from "node-cron";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

function getAIClient() {
  // Use GEMINI_API_KEY2 since the primary is unchangeable
  let key = process.env.GEMINI_API_KEY2;
  
  if (!key || key.length < 10) {
     const primaryKey = process.env.GEMINI_API_KEY;
     if (primaryKey && primaryKey !== "AI Studio Free Tier" && primaryKey !== "MY_GEMINI_API_KEY" && primaryKey.length > 10) {
       key = primaryKey;
     }
  }

  if (!key || key.length < 10) {
    console.error("WARNING: No valid Gemini key was found in environment. Please add GEMINI_API_KEY2.");
    return new GoogleGenAI({}); 
  }
  return new GoogleGenAI({ apiKey: key });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Store in memory 
  let activeSchedules: Record<string, cron.ScheduledTask> = {};

  app.post("/api/automations/execute-now", async (req, res) => {
    const { automationId, config } = req.body;
    
    if (automationId === 'wppconnect-analyzer') {
      try {
        const apiUrl = config.wppApiUrl.replace(/\/$/, ""); 
        const token = config.token;

        // 1. Tentar ler conversas (Pode falhar se o Token estiver errado)
        let unreadChats = [];
        try {
          let reqUrl = `${apiUrl}/chats`;
          
          // Correção automática para Z-API (se usuário não colocou /token/ na URL)
          if (apiUrl.includes("z-api.io") && !apiUrl.includes("/token/")) {
            reqUrl = `${apiUrl}/token/${token}/chats`;
          }

          const chatsResponse = await axios.get(reqUrl, {
            headers: { "Client-Token": token }
          });
          
          if (chatsResponse.data && chatsResponse.data.error) {
              throw new Error(chatsResponse.data.error);
          }
          
          unreadChats = chatsResponse.data || [];
        } catch (apiError: any) {
          const apiMsg = apiError.response?.data?.error || apiError.message;
          throw new Error(`Erro na Z-API ao ler conversas: ${apiMsg}. Verifique as credenciais ou a URL da sua API.`);
        }

        // Se não tem nada para ler, mockamos apenas para provar o conceito no teste
        if (unreadChats.length === 0) {
           unreadChats = [
             { sender: "Sistema AutoFlow", message: "Teste de integração bem sucedido! A Z-API está conectada, porém não havia mensagens para ler.", time: new Date().toISOString() }
           ];
        }

        // 2. Chamar o Gemini para analisar o JSON aplicando regras complexas
        const prompt = `Aqui estão as mensagens que recebi E enviei no WhatsApp (formato JSON): \n${JSON.stringify(unreadChats)}\n\nSiga estas 4 regras cruciais para sua análise:\n1. Analise as conversas da janela de **24 horas** (enviadas e lidas/recebidas).\n2. **Ignore grupos muito grandes**, focando no que é estratégico (1x1 ou grupos seletos).\n3. **Filtre ativamente**: decida você mesmo o que é útil ou não e exclua ruídos triviais.\n4. Feedback Comportamental Elaborado: Sua saída não deve ser um simples alerta de tarefas, mas sim uma análise sobre **como eu estou agindo**. Me dê feedback estruturado sobre meu tom de comunicação, velocidade nas resoluções e relacionamento com os contatos.\n\nEnvie formatado no padrão bonito de WhatsApp (usando asteriscos para negrito e parágrafos curtos).`;
        
        const ai = getAIClient();
        
        // Debugging the API key format to ensure it's loaded correctly
        const dbgKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY || "missing";
        
        if (dbgKey === "missing" || dbgKey === "AI Studio Free Tier" || dbgKey.length < 10) {
          throw new Error(`A chave gratuita do AI Studio falhou. Crie a váriavel "GEMINI_API_KEY2" no menu de Secrets e cole sua chave manual gerada no aistudio.google.com/app/apikey.`);
        }

        let aiResponse;
        let lastError;
        const modelsToTry = ["gemini-3.1-flash-lite-preview", "gemini-3-flash-preview", "gemini-3.1-pro-preview"];

        for (const modelName of modelsToTry) {
          try {
            console.log(`[DEBUG] Tentando gerar texto com o modelo: ${modelName}...`);
            aiResponse = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                systemInstruction: "Você é um Mentor Analítico e Conselheiro de Comunicação de Elite. Sua saída será recebida nativamente no WhatsApp do usuário. Pense criticamente, não apenas resuma: analise a postura do usuário nas conversas, deduza contextos das entrelinhas e dê uma resposta direta, elaborada e madura descartando o que é irrelevante."
              }
            });
            console.log(`[DEBUG] Sucesso com o modelo: ${modelName}!`);
            break; // Sai do loop se conseguiu gerar com sucesso
          } catch (geminiError: any) {
            console.warn(`[DEBUG] Modelo ${modelName} falhou: ${geminiError?.message}`);
            lastError = geminiError;
          }
        }

        if (!aiResponse) {
          const errMsg = lastError?.message || String(lastError);
          throw new Error(`Gemini SDK Error (Todos os modelos tentados falharam. Chave: ${dbgKey.substring(0, 5)}...): ${errMsg}`);
        }
        
        const responseText = "\n\n" + aiResponse.text + "\n\n_📌 Resumo gerado via IA - AutoFlow_";

        // 3. Enviar mensagem de volta
        let sendResult = null;
        try {
          let postUrl = `${apiUrl}/send-text`;
          if (apiUrl.includes("z-api.io") && !apiUrl.includes("/token/")) {
            postUrl = `${apiUrl}/token/${token}/send-text`;
          }

          const sendReq = await axios.post(postUrl, {
            phone: config.targetNumber,
            message: responseText
          }, { headers: { "Client-Token": token } });
          sendResult = "Mensagem com resumo enviada com sucesso para seu número via Z-API!";
        } catch (sendError: any) {
          const sendMsg = sendError.response?.data?.error || sendError.message;
          throw new Error(`O resumo foi gerado, mas falhou ao enviar de volta via Z-API: ${sendMsg}`);
        }

        res.json({ success: true, message: sendResult, generatedLog: responseText });
      } catch (error: any) {
        res.status(400).json({ error: error.message || "Erro desconhecido ao executar." });
      }
    } else {
       res.status(400).json({ error: "Automação não suporta execução imediata ainda." });
    }
  });

  app.post("/api/automations/schedule", (req, res) => {
    const { automationId, config } = req.body;
    
    if (automationId === 'wppconnect-analyzer') {
      // Iniciar o agendamento no node-cron
      if (activeSchedules[automationId]) {
        activeSchedules[automationId].stop();
      }

      console.log(`[🤖 WPP] Configurando Cron Job: 0 8,12,17,22 * * * para o número ${config.targetNumber}`);
      
      const job = cron.schedule('0 8,12,17,22 * * *', async () => {
         console.log(`[🤖 WPP] Executando rotina agendada (WPP Analyzer) para: ${config.targetNumber}`);
         try {
           const apiUrl = config.wppApiUrl.replace(/\/$/, ""); 
           const token = config.token;
           
           /* 
           * Exemplo conectando aos Endpoints da Z-API (Solução em Nuvem):
           * 1 - Puxar conversas:
           const chatsResponse = await axios.get(`${apiUrl}/chats`, {
              headers: { "Client-Token": token }
           });
           */
           
           // Dados mockados para simular a resposta de mensagens não lidas
           const mockChats = [
             { sender: "João (Cliente Premium)", message: "Oi, pode me passar o orçamento atualizado? Preciso fechar isso até o fim do dia.", time: "07:30" },
             { sender: "Maria (Sócia)", message: "Não esqueça de revisar os contratos para a reunião das 14h.", time: "07:45" },
             { sender: "Grupo de Família", message: "Bom dia com muito café!", time: "07:50" }
           ];

           // 2. Chamar o Gemini para analisar o JSON (Simulando o processamento assíncrono real)
           const prompt = `Aqui estão as mensagens importadas do WppConnect em formato JSON: \n${JSON.stringify(mockChats)}\n\nLeia este JSON focado em extrair pontos de atenção e urgência cruciais para mim. Mande o texto já em formato de WhatsApp (usando asteriscos para negrito).`;
           
           const ai = getAIClient();
           const aiResponse = await ai.models.generateContent({
             model: "gemini-3-flash-preview",
             contents: prompt,
             config: {
               systemInstruction: "Você é um assistente proativo. Sua resposta será enviada como uma notificação de sistema via WhatsApp. Analise o JSON de conversas e monte um pequeno resumo (2-3 parágrafos) sinalizando conversas importantes."
             }
           });
           
           const responseText = aiResponse.text;

           // 3. Enviar mensagem de volta
           /*
           await axios.post(`${apiUrl}/send-text`, {
             phone: config.targetNumber,
             message: responseText
           }, { headers: { "Client-Token": token } });
           */
           
           console.log(`[✅ WPP] Finalizada rotina com sucesso. Resumo a ser enviado:`, responseText);

         } catch (error) {
           console.error("[ERRO WPP] Falha na automação do WPP:", error);
         }
      });

      activeSchedules[automationId] = job;
      res.json({ success: true, message: "Agendamento ativado com sucesso para os horários: 08:00, 12:00, 17:00 e 22:00!" });
    } else {
       res.status(400).json({ error: "Automação não reconhecida" });
    }
  });

  // Vite middleware for development (fallback if not building for production)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
