import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onReset: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onReset }) => {
  return (
    <div className="min-h-screen bg-iron-950 text-gray-100 font-sans selection:bg-gold-500 selection:text-black">
      <header className="fixed top-0 w-full border-b border-gray-800 bg-iron-950/80 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-gold-500" />
            <span className="font-bold text-lg tracking-wider">IRON<span className="text-gold-500">HOUR</span></span>
          </div>
          <button 
            onClick={onReset}
            className="text-gray-500 hover:text-red-400 transition-colors text-xs flex items-center gap-1"
          >
            <LogOut size={14} />
            Reset Profile
          </button>
        </div>
      </header>
      <main className="pt-20 pb-10 px-4 max-w-5xl mx-auto min-h-[calc(100vh-40px)]">
        {children}
      </main>
      <footer className="text-center py-6 text-gray-600 text-sm">
        <p>"Success is built one hour at a time."</p>
      </footer>
    </div>
  );
};