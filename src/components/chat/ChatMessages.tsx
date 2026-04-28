import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: number;
};

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  userId?: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isTyping, userId, scrollRef }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const scrollHeight = scrollContainer.scrollHeight;
      const height = scrollContainer.clientHeight;
      const maxScrollTop = scrollHeight - height;
      
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        scrollContainer.scrollTo({
          top: maxScrollTop + 100, // Small extra to be safe
          behavior: messages.length <= 1 ? 'auto' : 'smooth'
        });
      });
    }
  }, [messages, isTyping, scrollRef]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar space-y-3">
      <div className="flex justify-center my-4">
        <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-widest rounded-full">
          Chat Started
        </span>
      </div>
      
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn(
               "flex",
               msg.sender_id === userId ? "justify-end" : "justify-start"
            )}
          >
            <div className={msg.sender_id === userId ? "chat-bubble-user" : "chat-bubble-partner"}>
              {msg.content}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-start"
        >
          <div className="chat-bubble-partner flex gap-1 items-center py-3">
            <div className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        </motion.div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};
