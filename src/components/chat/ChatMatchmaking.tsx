import React from 'react';
import { motion } from 'motion/react';

interface ChatMatchmakingProps {
  userGender?: string;
}

export const ChatMatchmaking: React.FC<ChatMatchmakingProps> = ({ userGender }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-bg-soft/50">
      <div className="glass p-8 rounded-3xl text-center shadow-xl border border-white max-w-xs w-full">
        <div className="relative mb-6 mx-auto w-24 h-24">
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-pink-primary rounded-full"
          ></motion.div>
          <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-pink-100 p-2 overflow-hidden ring-4 ring-pink-primary/10">
            {userGender === 'Male' ? (
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Me" className="w-full h-full" />
            ) : (
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" alt="Me" className="w-full h-full" />
            )}
          </div>
        </div>
        <h2 className="text-xl font-display font-bold text-pink-primary">Finding Partner...</h2>
        <p className="text-slate-400 mt-2 text-sm font-medium leading-relaxed">Matching you with someone special worldwide...</p>
        
        <div className="mt-8 flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                backgroundColor: ['#ff99cc', '#ff4d8d', '#ff99cc']
              }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,153,204,0.5)]"
            ></motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
