import { useState } from 'react';
import { Play, ArrowLeft, Loader2, Copy, CheckCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { automationsCatalog } from '../lib/automations';
import { runAutomation } from '../lib/gemini';
import { ExecutionHistory } from '../types';

interface ExecutionViewProps {
  automationId: string;
  onNavigate: (view: string) => void;
  onExecutionComplete: (history: ExecutionHistory) => void;
}

export function ExecutionView({ automationId, onNavigate, onExecutionComplete }: ExecutionViewProps) {
  const automation = automationsCatalog.find(a => a.id === automationId);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!automation) return null;

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isScheduled = automation.executionType === 'scheduled';

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (isScheduled) {
        // Run scheduled backend automation config
        const response = await fetch('/api/automations/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ automationId: automation.id, config: formData })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Falha ao agendar');
        
        setResult(`✅ **Agendamento Ativo!** \n\n${data.message}\n\nA automação foi salva no backend Node.js e o Cron Job começará a observar suas mensagens para enviar resumos.`);
        
        onExecutionComplete({
          id: Math.random().toString(36).substring(7),
          automationId: automation.id,
          automationTitle: automation.title + " (Agendamento Ativado)",
          timestamp: Date.now(),
          request: formData,
          response: "Status: Agendamento ativo nos horários programados."
        });
      } else {
        // Standard Manual execution through Gemini directly on client
        const promptEntries = Object.entries(formData).map(([k, v]) => {
          const fieldDef = automation.fields.find(f => f.name === k);
          return `**${fieldDef?.label || k}:**\n${v}\n`;
        });
        const prompt = `Here is the user input:\n\n${promptEntries.join('\n')}`;

        const generatedText = await runAutomation(automation.systemInstruction, prompt);
        setResult(generatedText);
        
        const execRecord: ExecutionHistory = {
          id: Math.random().toString(36).substring(7),
          automationId: automation.id,
          automationTitle: automation.title,
          timestamp: Date.now(),
          request: formData,
          response: generatedText
        };
        
        onExecutionComplete(execRecord);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-[32px_40px] max-w-6xl mx-auto w-full">
      <button 
        onClick={() => onNavigate('automations')}
        className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6 transition-colors text-[0.875rem]"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Automações
      </button>

      <div className="mb-8">
        <h1 className="text-[1.5rem] font-bold text-[#111827]">{automation.title}</h1>
        <p className="text-[#6B7280] text-[0.875rem] mt-1">{automation.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleExecute} className="bg-white p-6 rounded-xl border border-[#E5E7EB]">
            <h2 className="text-[0.875rem] font-semibold text-[#6B7280] mb-4">Configuração</h2>
            
            <div className="space-y-4">
              {automation.fields.map(field => (
                <div key={field.name}>
                  <label className="block text-[0.875rem] font-medium text-[#111827] mb-1">
                    {field.label} {field.required && <span className="text-[#2563EB]">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea 
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2563EB] resize-y min-h-[120px] text-[0.875rem] text-[#111827]"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  ) : field.type === 'select' ? (
                    <select 
                      required={field.required}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2563EB] text-[0.875rem] text-[#111827]"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    >
                      <option value="" disabled>Selecione uma opção</option>
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2563EB] text-[0.875rem] text-[#111827]"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-[#2563EB] text-white flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-[0.875rem] hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    {isScheduled ? "Salvar Agendamento" : "Executar Automação"}
                  </>
                )}
              </button>
              
              {isScheduled && (
                <button 
                  type="button" 
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    setResult(null);
                    try {
                      const response = await fetch('/api/automations/execute-now', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ automationId: automation.id, config: formData })
                      });
                      const data = await response.json();
                      if (!response.ok) throw new Error(data.error || 'Falha ao testar');
                      
                      setResult(`✅ **Teste Disparado com Sucesso!** \n\n${data.message}\n\n**Log Gerado (Resposta Enviada)**:\n${data.generatedLog}`);
                      
                      onExecutionComplete({
                        id: Math.random().toString(36).substring(7),
                        automationId: automation.id,
                        automationTitle: automation.title + " (Teste Imediato)",
                        timestamp: Date.now(),
                        request: formData,
                        response: data.generatedLog
                      });
                    } catch (err: any) {
                      setError(err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="bg-[#E5E7EB] text-gray-800 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-[0.875rem] hover:bg-gray-300 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  Disparar Teste Agora
                </button>
              )}
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}
          </form>
        </div>

        <div>
           <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-4">
              <h2 className="text-[0.875rem] font-semibold text-[#6B7280]">Resultado</h2>
              {result && (
                <button 
                  onClick={handleCopy}
                  className="text-[#2563EB] hover:underline flex items-center gap-1.5 text-[0.875rem] font-semibold transition"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto rounded-lg">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-[#6B7280]">
                  <Loader2 className="w-6 h-6 animate-spin mb-4" />
                  <p className="text-[0.875rem]">A inteligência artificial está trabalhando...</p>
                </div>
              ) : result ? (
                <div className="markdown-body prose max-w-none prose-p:leading-relaxed text-[0.875rem] text-[#111827]">
                  <Markdown>{result}</Markdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#6B7280]">
                  <p className="text-[0.875rem]">O resultado da automação aparecerá aqui.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
