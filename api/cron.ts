import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

// Configure this in Vercel Environment Variables!
const VERCEL_FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : null;

if (VERCEL_FIREBASE_SERVICE_ACCOUNT && getApps().length === 0) {
  initializeApp({
    credential: cert(VERCEL_FIREBASE_SERVICE_ACCOUNT)
  });
}

export default async function handler(req: any, res: any) {
  // Verificação de segurança (Secret opcional configurado na Vercel)
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (!VERCEL_FIREBASE_SERVICE_ACCOUNT) {
    return res.status(500).json({ success: false, error: 'FIREBASE_SERVICE_ACCOUNT not configured in Vercel Env Vars' });
  }

  try {
    const db = getFirestore();
    const usersSnapshot = await db.collectionGroup('automations').where('isActive', '==', true).get();

    let executed = 0;
    const errors: string[] = [];

    // Importante: No Nodejs da Vercel a GEMINI_API_KEY deve ser configurada
    const aiKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey: aiKey || "missing" });

    // Avalia o horário atual em (HH:00) para cruzar com o schedule do usuário
    const currentHour = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });

    for (const doc of usersSnapshot.docs) {
      if (doc.id === 'wppconnect-analyzer') {
        const config = doc.data();
        
        // Vercel vai disparar essa API de 1 em 1 hora.
        // Opcional: checar se o horário bate com 'schedules' [ "08:00", ... ], ou se roda direto.
        // Simulando execução
        try {
          let apiUrl = config.wppApiUrl.replace(/\/$/, ""); 
          const token = config.token;

          let reqUrl = `${apiUrl}/chats`;
          if (apiUrl.includes("z-api.io") && !apiUrl.includes("/token/")) {
            reqUrl = `${apiUrl}/token/${token}/chats`;
          }

          const chatsResponse = await axios.get(reqUrl, {
            headers: { "Client-Token": token }
          });
          const unreadChats = chatsResponse.data || [];

          if (unreadChats.length === 0) continue; 

          const prompt = `Aqui estão as mensagens que recebi E enviei no WhatsApp (formato JSON): \n${JSON.stringify(unreadChats)}\n\nSiga estas 4 regras cruciais para sua análise:\n1. Analise as conversas da janela de **24 horas** (enviadas e lidas/recebidas).\n2. **Ignore grupos muito grandes**, focando no que é estratégico (1x1 ou grupos seletos).\n3. **Filtre ativamente**: decida você mesmo o que é útil ou não e exclua ruídos triviais.\n4. Feedback Comportamental Elaborado: Sua saída não deve ser um simples alerta de tarefas, mas sim uma análise sobre **como eu estou agindo**. Me dê feedback estruturado sobre meu tom de comunicação, velocidade nas resoluções e relacionamento com os contatos.\n\nEnvie formatado no padrão bonito de WhatsApp (usando asteriscos para negrito e parágrafos curtos).`;
          
          let aiResponse;
          const modelsToTry = ["gemini-3.1-flash-lite-preview", "gemini-3-flash-preview", "gemini-3.1-pro-preview"];
          
          for (const modelName of modelsToTry) {
            try {
              aiResponse = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {
                  systemInstruction: "Você é um Mentor Analítico e Conselheiro de Comunicação de Elite. Sua saída será recebida nativamente no WhatsApp do usuário. Pense criticamente, não apenas resuma: analise a postura do usuário nas conversas, deduza contextos das entrelinhas e dê uma resposta direta, elaborada e madura descartando o que é irrelevante."
                }
              });
              break; 
            } catch (err) {}
          }

          if (aiResponse) {
             const responseText = "\n\n" + aiResponse.text + "\n\n_📌 AutoFlow Vercel Cron_";
             
             let postUrl = `${apiUrl}/send-text`;
             if (apiUrl.includes("z-api.io") && !apiUrl.includes("/token/")) {
               postUrl = `${apiUrl}/token/${token}/send-text`;
             }

             await axios.post(postUrl, {
               phone: config.targetNumber,
               message: responseText
             }, { headers: { "Client-Token": token } });
             executed++;
          }

        } catch (e: any) {
          errors.push(`Error executing uid ${config.uid}: ${e.message}`);
        }
      }
    }

    res.status(200).json({ success: true, executed, errors });
  } catch (globalError: any) {
    res.status(500).json({ success: false, error: globalError.message });
  }
}
