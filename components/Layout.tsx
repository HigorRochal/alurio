
import React, { useState } from 'react';
import { Logo } from '../constants';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, currentPath, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: '🏠' },
    { id: 'script', label: 'Roteirista', icon: '🎬' },
    { id: 'post', label: 'Criador de Post', icon: '📱' },
    { id: 'library', label: 'Biblioteca', icon: '📚' },
    { id: 'pricing', label: 'Planos', icon: '💎' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b px-6 py-4 flex items-center justify-between">
        <Logo size={28} />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 bg-gray-50 rounded-xl">
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className={`
        fixed inset-0 z-40 md:relative md:z-auto
        bg-white border-r w-72 h-full transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 h-full flex flex-col">
          <div className="hidden md:block mb-12">
            <Logo size={36} />
          </div>

          <nav className="flex-1 space-y-3">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] text-sm font-bold transition-all ${
                  currentPath === item.id 
                    ? 'bg-alurio-gradient text-white shadow-lg scale-105' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-gray-100">
            <div className="flex items-center gap-4 px-2">
              <div className="w-12 h-12 rounded-[18px] bg-alurio-gradient text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest truncate">Plano {user.plan}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
