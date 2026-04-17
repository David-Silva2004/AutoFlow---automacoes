import { History } from 'lucide-react';
import { ExecutionHistory } from '../types';

interface HistoryViewProps {
  history: ExecutionHistory[];
}

export function HistoryView({ history }: HistoryViewProps) {
  return (
    <div className="p-[32px_40px] max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-[1.5rem] font-bold text-[#111827]">Logs de Execução</h1>
        <p className="text-[#6B7280] text-[0.875rem] mt-1">Veja todas as automações que você já executou.</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {history.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="bg-[#F9FAFB] p-[#12px_20px] text-[0.75rem] font-semibold text-[#6B7280] border-b border-[#E5E7EB] py-3 px-5">AUTOMAÇÃO</th>
                <th className="bg-[#F9FAFB] p-[#12px_20px] text-[0.75rem] font-semibold text-[#6B7280] border-b border-[#E5E7EB] py-3 px-5">DATA</th>
                <th className="bg-[#F9FAFB] p-[#12px_20px] text-[0.75rem] font-semibold text-[#6B7280] border-b border-[#E5E7EB] py-3 px-5">ENTRADA E RESULTADO</th>
              </tr>
            </thead>
            <tbody>
              {history.map((exec) => (
                <tr key={exec.id}>
                  <td className="p-[#16px_20px] text-[0.875rem] border-b border-[#E5E7EB] py-4 px-5 align-top">
                    {exec.automationTitle}
                  </td>
                  <td className="p-[#16px_20px] text-[0.875rem] border-b border-[#E5E7EB] py-4 px-5 align-top whitespace-nowrap">
                    {new Date(exec.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-[#16px_20px] text-[0.875rem] border-b border-[#E5E7EB] py-4 px-5 align-top">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#F9FAFB] p-3 rounded border border-[#E5E7EB]">
                        <p className="text-[0.75rem] uppercase font-semibold text-[#6B7280] mb-2">Entrada</p>
                        <div className="space-y-1">
                          {Object.entries(exec.request).map(([k, v]) => (
                            <div key={k}>
                              <span className="text-[0.75rem] font-medium text-[#6B7280] block">{k}</span>
                              <span className="text-[0.875rem] text-[#111827] line-clamp-2">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-[#EFF6FF] p-3 rounded border border-[#BFDBFE]">
                        <p className="text-[0.75rem] uppercase font-semibold text-[#2563EB] mb-2">Saída</p>
                        <div className="text-[0.875rem] text-[#111827] line-clamp-3">
                          {exec.response}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <History className="w-12 h-12 text-[#E5E7EB] mb-4" />
            <h3 className="text-[#111827] font-medium mb-1">Seu histórico está vazio</h3>
            <p className="text-[#6B7280] text-[0.875rem] max-w-sm">
              Quando você rodar suas automações, elas ficarão salvas aqui para você consultar depois.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
