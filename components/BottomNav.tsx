
import React from 'react';
import { ViewType } from '../types';

interface BottomNavProps {
  activeTab: ViewType;
  onTabChange: (tab: ViewType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'players', label: 'Jogadores', icon: 'group' },
    { id: 'draw', label: 'Sorteio', icon: 'sports_volleyball' },
    { id: 'finance', label: 'Mensalidade', icon: 'payments' },
    { id: 'download', label: 'Instalar', icon: 'install_mobile' },
    { id: 'settings', label: 'Ajustes', icon: 'settings' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 pb-8 pt-2 px-4 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as ViewType)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-primary scale-110' : 'text-slate-400'
              }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: activeTab === item.id ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className={`text-[10px] ${activeTab === item.id ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
