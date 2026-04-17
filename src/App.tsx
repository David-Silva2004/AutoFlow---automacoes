/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { AutomationsView } from './views/AutomationsView';
import { ExecutionView } from './views/ExecutionView';
import { HistoryView } from './views/HistoryView';
import { ExecutionHistory } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);
  const [history, setHistory] = useState<ExecutionHistory[]>([]);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    if (id) setSelectedAutomation(id);
  };

  const handleExecutionComplete = (execRecord: ExecutionHistory) => {
    setHistory(prev => [execRecord, ...prev]);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans text-[#111827]">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      
      <main className="flex-1 overflow-y-auto">
        {currentView === 'dashboard' && (
          <DashboardView onNavigate={handleNavigate} history={history} />
        )}
        
        {currentView === 'automations' && (
          <AutomationsView onNavigate={handleNavigate} />
        )}
        
        {currentView === 'execution' && selectedAutomation && (
          <ExecutionView 
            automationId={selectedAutomation} 
            onNavigate={handleNavigate}
            onExecutionComplete={handleExecutionComplete}
          />
        )}
        
        {currentView === 'history' && (
          <HistoryView history={history} />
        )}
      </main>
    </div>
  );
}
