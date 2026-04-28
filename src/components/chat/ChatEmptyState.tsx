import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, RefreshCcw } from 'lucide-react';

interface ChatEmptyStateProps {
  onFindPartner: () => void;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onFindPartner }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="w-32 h-32 pink-gradient rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-8 border-4 border-white"
      >
        <Sparkles className="text-white" size={64} />
      </motion.div>
      <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Ready to Spark?</h2>
      <p className="text-slate-400 max-w-xs mb-8 font-medium">
        Find incredible people randomly and start chatting. Who knows who you'll meet today?
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onFindPartner}
        className="px-10 py-5 pink-gradient text-white rounded-2xl font-bold text-xl shadow-xl shadow-pink-200 flex items-center gap-3"
      >
        <span>Find Partner</span>
        <RefreshCcw size={24} />
      </motion.button>
    </div>
  );
};
