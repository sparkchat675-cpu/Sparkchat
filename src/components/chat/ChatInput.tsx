import React from 'react';
import { Send, Image as ImageIcon } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ inputText, setInputText, onSendMessage }) => {
  return (
    <div className="p-3 bg-white border-t border-pink-100 flex items-center gap-3">
      <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors shrink-0">
        <ImageIcon size={20} />
      </button>
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="New message..."
          className="w-full h-11 px-4 pr-10 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-pink-300 transition-all font-medium text-sm text-text-main placeholder:text-slate-400"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
        />
        <button
          onClick={onSendMessage}
          disabled={!inputText.trim()}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 pink-gradient text-white flex items-center justify-center rounded-lg disabled:opacity-50 transition-all shadow-md active:scale-95"
        >
          <Send size={14} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
};
