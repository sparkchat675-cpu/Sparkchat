import React from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';

type ChatPartner = {
  id: string;
  name: string;
  avatar_url: string;
  gender: string;
  country: string;
  isBot?: boolean;
};

interface ChatHeaderProps {
  partner: ChatPartner | null;
  onEndChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ partner, onEndChat }) => {
  return (
    <header className="h-20 flex items-center justify-between px-6 bg-white border-b border-pink-100 shadow-sm z-10">
      {partner ? (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 p-0.5 bg-gradient-to-tr from-pink-primary to-pink-secondary rounded-full shadow-lg">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <img src={partner.avatar_url} alt={partner.name} className="w-full h-full rounded-full bg-slate-50" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="font-display font-bold text-text-main leading-tight">{partner.name}</h2>
            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">{partner.country} • {partner.gender}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 pink-gradient rounded-2xl flex items-center justify-center shadow-lg relative group overflow-hidden">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
               className="absolute inset-0 bg-white/10"
             />
             <Heart className="text-white fill-white relative z-10" size={24} />
             <Sparkles className="text-white absolute top-1 right-1 z-10 animate-pulse" size={14} />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-pink-primary tracking-tight">SparkChat</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Find your connection</p>
          </div>
        </div>
      )}
      
      {partner && (
        <button 
          onClick={onEndChat}
          className="px-5 h-11 bg-pink-50 text-pink-primary rounded-2xl font-bold text-sm hover:bg-pink-100 transition-all active:scale-95 border border-pink-200"
        >
          Leave
        </button>
      )}
    </header>
  );
};
