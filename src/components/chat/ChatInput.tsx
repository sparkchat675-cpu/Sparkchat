import React from 'react';
import { Send, Image as ImageIcon } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ inputText, setInputText, onSendMessage }) => {
  return (
    <div className="p-6 bg-white border-t border-pink-100 flex items-center gap-4">
      <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
        <ImageIcon size={24} />
      </button>
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full h-12 px-6 bg-pink-50 rounded-2xl border-none focus:ring-2 focus:ring-pink-300 transition-all font-medium text-sm text-text-main placeholder:text-pink-300"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
        />
        <button
          onClick={onSendMessage}
          disabled={!inputText.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 pink-gradient text-white flex items-center justify-center rounded-xl disabled:opacity-50 transition-all shadow-md active:scale-90"
        >
          <Send size={16} className="rotate-[15deg]" />
        </button>
      </div>
    </div>
  );
};
