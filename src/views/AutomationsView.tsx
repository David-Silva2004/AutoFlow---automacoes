import { FileText, MessageSquareText, Code2, Mail, Bot } from 'lucide-react';
import { automationsCatalog } from '../lib/automations';

interface AutomationsViewProps {
  onNavigate: (view: string, id?: string) => void;
}

const iconMap: Record<string, any> = {
  FileText,
  MessageSquareText,
  Code2,
  Mail,
  Bot
};

export function AutomationsView({ onNavigate }: AutomationsViewProps) {
  return (
    <div className="p-[32px_40px] max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-[1.5rem] font-bold text-[#111827]">Biblioteca de Automações</h1>
        <p className="text-[#6B7280] text-[0.875rem] mt-1">Escolha uma ferramenta para iniciar sua tarefa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {automationsCatalog.map((automation) => {
          const Icon = iconMap[automation.icon] || Bot;
          
          return (
            <div 
              key={automation.id} 
              className="bg-white p-5 rounded-xl border border-[#E5E7EB] hover:border-[#2563EB] transition-colors cursor-pointer flex flex-col"
              onClick={() => onNavigate('execution', automation.id)}
            >
              <div className="bg-[#F8F9FA] w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#6B7280]" />
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-2">{automation.title}</h3>
              <p className="text-[0.875rem] text-[#6B7280] mb-6 flex-grow">{automation.description}</p>
              
              <div className="mt-auto">
                <button className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-[0.875rem] font-semibold w-full hover:bg-blue-700 transition">
                  Usar Automação
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
