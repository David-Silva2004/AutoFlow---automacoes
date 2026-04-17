import { useState } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  History, 
  Settings,
  Zap,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'automations', label: 'Minhas Automações', icon: Bot },
    { id: 'history', label: 'Logs de Execução', icon: History },
  ];

  return (
    <div className="w-[240px] h-screen bg-[#FFFFFF] flex flex-col border-r border-[#E5E7EB]">
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-[1.25rem] tracking-[-0.025em] text-[#2563EB] mb-10">
          <Zap className="w-6 h-6 fill-current text-[#2563EB]" />
          <span>AutoFlow</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[0.875rem] transition-colors group",
                  isActive 
                    ? "bg-[#EFF6FF] text-[#2563EB] font-semibold" 
                    : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]"
                )}
              >
                <div className="flex items-center gap-3">
                  <span>{item.label}</span>
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[0.875rem] text-[#6B7280] hover:text-[#111827] hover:bg-gray-50 transition-colors">
          <span>Configurações</span>
        </button>
      </div>
    </div>
  );
}
