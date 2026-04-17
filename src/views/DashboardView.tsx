import { History, Bot, PlayCircle } from 'lucide-react';
import { ExecutionHistory } from '../types';
import { automationsCatalog } from '../lib/automations';

interface DashboardViewProps {
  onNavigate: (view: string, id?: string) => void;
  history: ExecutionHistory[];
}

export function DashboardView({ onNavigate, history }: DashboardViewProps) {
  const recentExecutions = history.slice(0, 5);

  return (
    <div className="p-[32px_40px] max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[1.5rem] font-bold text-[#111827]">Central de Automações</h1>
          <p className="text-[#6B7280] text-[0.875rem] mt-1">Gerencie seus fluxos inteligentes com Gemini AI</p>
        </div>
        <button 
          onClick={() => onNavigate('automations')}
          className="bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-[0.875rem] font-semibold hover:bg-blue-700 transition"
        >
          + Criar Automação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
          <p className="text-[0.75rem] uppercase tracking-[0.05em] text-[#6B7280] mb-2 font-medium">TOTAL DISPONÍVEIS</p>
          <p className="text-[1.5rem] font-bold text-[#111827]">{automationsCatalog.length}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
          <p className="text-[0.75rem] uppercase tracking-[0.05em] text-[#6B7280] mb-2 font-medium">EXECUÇÕES</p>
          <p className="text-[1.5rem] font-bold text-[#111827]">{history.length}</p>
        </div>
      </div>

      <p className="text-[0.875rem] font-semibold text-[#6B7280] mb-4">Automações Recentes</p>
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        
        {recentExecutions.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="bg-[#F9FAFB] p-[#12px_20px] text-[0.75rem] font-semibold text-[#6B7280] border-b border-[#E5E7EB] py-3 px-5">NOME DA AUTOMAÇÃO</th>
                <th className="bg-[#F9FAFB] p-[#12px_20px] text-[0.75rem] font-semibold text-[#6B7280] border-b border-[#E5E7EB] py-3 px-5">STATUS</th>
                <th className="bg-[#F9FAFB] p-[#12px_20px] text-[0.75rem] font-semibold text-[#6B7280] border-b border-[#E5E7EB] py-3 px-5">ÚLTIMA EXECUÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {recentExecutions.map((exec) => (
                <tr key={exec.id}>
                  <td className="p-[#16px_20px] text-[0.875rem] border-b border-[#E5E7EB] py-4 px-5">
                    {exec.automationTitle}
                  </td>
                  <td className="p-[#16px_20px] text-[0.875rem] border-b border-[#E5E7EB] py-4 px-5">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[0.75rem] font-medium bg-[#ECFDF5] text-[#065F46]">
                      Concluído
                    </span>
                  </td>
                  <td className="p-[#16px_20px] text-[0.875rem] border-b border-[#E5E7EB] py-4 px-5">
                    {new Date(exec.timestamp).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <History className="w-12 h-12 text-[#E5E7EB] mb-4" />
            <h3 className="text-[#111827] font-medium mb-1">Nenhuma execução ainda</h3>
            <p className="text-[#6B7280] text-[0.875rem] max-w-sm mb-6">
              Comece a economizar tempo escolhendo uma automação na biblioteca.
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-[#EFF6FF] border border-[#2563EB] rounded-lg flex items-center gap-3">
        <div className="text-[1.25rem]">✨</div>
        <div className="text-[0.875rem] text-[#2563EB]">
            <strong>Sugestão do Gemini:</strong> Identificamos que você pode automatizar a "Geração de Relatórios Semanais". Deseja criar este fluxo agora?
        </div>
        <button className="ml-auto bg-transparent border border-[#2563EB] text-[#2563EB] px-3 py-1 rounded font-semibold min-w-max cursor-pointer text-sm">Configurar</button>
      </div>
    </div>
  );
}
