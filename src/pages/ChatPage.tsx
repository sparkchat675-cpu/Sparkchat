import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Image as ImageIcon, Heart, Sparkles, AlertCircle, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { generateBotResponse } from '../services/aiService';
import { cn } from '../lib/utils';

type ChatPartner = {
  id: string;
  name: string;
  avatar_url: string;
  gender: string;
  country: string;
  isBot?: boolean;
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: number;
};

export default function ChatPage() {
  const { user } = useAuth();
  const [searching, setSearching] = useState(false);
  const [partner, setPartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Audio effects could be added here
  
  useEffect(() => {
    const initChat = async () => {
      if (user) {
        await supabase.from('users').update({ status: 'searching' }).eq('id', user.id);
      }
      findPartner();
    };
    initChat();
    
    return () => {
      if (user) {
        supabase.from('users').update({ status: 'online', current_partner_id: null }).eq('id', user.id);
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !partner) return;
    
    const userMsg = inputText.toLowerCase();
    
    // Quick bad words check (simplified)
    const badWords = ['fuck', 'shit', 'bitch', 'asshole', 'fuk', 'motherfucker'];
    const hasBadWords = badWords.some(word => userMsg.includes(word));
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender_id: user?.id || 'me',
      content: inputText,
      created_at: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    if (hasBadWords && partner.isBot) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const exitLines = [
          "nah i'm out. bye.",
          "not vibing with this attitude. later.",
          "too much negativity here. gtg.",
          "um, anyway. i'm leaving. bye.",
          "be nice or don't talk. i'm out.",
          "cant deal with this energy rn. bye.",
          "chill out... i'm done. 👋"
        ];
        const exitMsg = exitLines[Math.floor(Math.random() * exitLines.length)];

        const botMessage: Message = {
          id: Date.now().toString() + '_bot',
          sender_id: partner.id,
          content: exitMsg,
          created_at: Date.now()
        };
        setMessages(prev => [...prev, botMessage]);
        setTimeout(() => {
          setPartner(null);
          findPartner();
        }, 2000);
      }, 1200);
      return;
    }
    
    if (partner.isBot) {
      // Artificial thinking delay (reading time)
      const thinkDelay = 1500 + Math.random() * 2000;
      
      setTimeout(async () => {
        setIsTyping(true);
        
        const chatHistory = messages.slice(-6).map(m => ({
          role: m.sender_id === user?.id ? 'user' : 'model' as 'user' | 'model',
          text: m.content
        }));
        
        const rawBotText = await generateBotResponse(
          inputText, 
          user?.gender || 'Other', 
          user?.country || 'Other',
          chatHistory
        );
        
        const shouldEnd = rawBotText.includes('[END_CHAT]');
        const botText = rawBotText.replace('[END_CHAT]', '').trim();

        // Typing duration (fast for Gen Z, but not instant)
        const typingDuration = 1200 + Math.random() * 2500;
        
        setTimeout(() => {
          setIsTyping(false);
          const botMessage: Message = {
            id: Date.now().toString() + '_bot',
            sender_id: partner.id,
            content: botText,
            created_at: Date.now()
          };
          setMessages(prev => [...prev, botMessage]);
          
          if (shouldEnd) {
            setTimeout(() => {
              setPartner(null);
              findPartner();
            }, 3000);
          }
        }, typingDuration);
      }, thinkDelay);
    }
  };

  const findPartner = async () => {
    if (!user) return;
    
    setSearching(true);
    setPartner(null);
    setMessages([]);
    
    // Set my status to searching in DB
    await supabase.from('users').update({ status: 'searching', current_partner_id: null }).eq('id', user.id);
    
    // We'll try to find a real user for about 8-10 seconds max
    const startTime = Date.now();
    const maxSearchTime = 8000 + Math.random() * 2000;
    
    const pollForPartner = async () => {
      try {
        const targetGender = user.gender === 'Male' ? 'Female' : (user.gender === 'Female' ? 'Male' : 'Other');
        
        // 1. Try to find a real user who is searching
        const { data: realUsers, error } = await supabase
          .from('users')
          .select('*')
          .eq('gender', targetGender)
          .eq('status', 'searching')
          .neq('id', user.id)
          .limit(1);

        if (!error && realUsers && realUsers.length > 0) {
          const matchedUser = realUsers[0];
          
          // Update both users to 'chatting' status
          await Promise.all([
            supabase.from('users').update({ status: 'chatting', current_partner_id: matchedUser.id }).eq('id', user.id),
            supabase.from('users').update({ status: 'chatting', current_partner_id: user.id }).eq('id', matchedUser.id)
          ]);

          setPartner({
            id: matchedUser.id,
            name: matchedUser.name,
            avatar_url: matchedUser.avatar_url,
            gender: matchedUser.gender,
            country: matchedUser.country,
            isBot: false
          });
          setSearching(false);
          return true;
        }
        
        // If timed out, fallback to bot
        if (Date.now() - startTime > maxSearchTime) {
          setupRealisticPartner();
          await supabase.from('users').update({ status: 'chatting' }).eq('id', user.id);
          setSearching(false);
          return true;
        }
        
        return false;
      } catch (err) {
        console.error("Matchmaking error:", err);
        setupRealisticPartner();
        setSearching(false);
        return true;
      }
    };

    // Initial check
    const found = await pollForPartner();
    if (!found) {
      // Poll every 1.5 seconds if not found
      const interval = setInterval(async () => {
        const isFinished = await pollForPartner();
        if (isFinished) clearInterval(interval);
      }, 1500);
    }
  };

  const setupRealisticPartner = () => {
    const targetGender = user?.gender === 'Male' ? 'Female' : (user?.gender === 'Female' ? 'Male' : 'Other');
    
    const botPool: Record<string, string[]> = {
      Female: [
        'Riya', 'Emily', 'Sophie', 'Zainab', 'Anika', 'Monalisa', 'Maya', 'Kiara', 'Sara', 'Elena', 
        'Zara', 'Nora', 'Chloe', 'Amara', 'Priya', 'Nikita', 'Isha', 'Hana', 'Lina', 'Sana'
      ],
      Male: [
        'Aman', 'Jake', 'Harry', 'Bilal', 'Tanvir', 'Aryan', 'Sam', 'Rohan', 'Arjun', 'Kevin',
        'Zaid', 'Faisal', 'Noah', 'Liam', 'Abhi', 'Ishaan', 'Kabir', 'Omar', 'Yash', 'Dev'
      ],
      Other: ['Leo', 'Kai', 'Sky', 'River', 'Alex', 'Parker', 'Sage', 'Jordan']
    };
    
    const names = botPool[targetGender] || botPool['Other'];
    const name = names[Math.floor(Math.random() * names.length)];
    // Unique seed for avatar to prevent duplicates
    const seed = `${name}_${Math.random().toString(36).substr(2, 5)}`;
    
    const realisticPartner: ChatPartner = {
      id: 'bot_' + Math.random().toString(36).substr(2, 9),
      name,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
      gender: targetGender,
      country: user?.country || 'Other',
      isBot: true
    };
    
    setPartner(realisticPartner);
    
    const country = realisticPartner.country;
    const pool: Record<string, string[]> = {
      India: ['hey!', 'ji?', 'hiii', 'sup?', 'namaste :)', 'kya haal hai?', 'yo', 'hey friend', 'hello!', 'hii'],
      Nepal: ['hey!', 'saugat!', 'hi there', 'sup?', 'k cha?', 'hellooo', 'namaste'],
      USA: ['hey u', 'hiii', 'whats up', 'sup', 'yo!', 'heyy', 'hi :)', 'hii', 'howdy', 'heyyy'],
      UK: ['hi!', 'hey there', 'you alright?', 'hiya', 'cheers', 'hello!', 'heyy'],
      Pakistan: ['hey', 'salam!', 'hiii', 'kya haal?', 'sup', 'hello', 'asalam o alaikum'],
      Bangladesh: ['hey!', 'ki khobor?', 'hiii', 'hello', 'sup?', 'assalamu alaikum'],
      Other: ['hey', 'hi!', 'hello', 'sup', 'hi hi', 'hiya', 'heyy', 'hola', 'yo']
    };

    const greetings = pool[country] || pool['Other'];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    setTimeout(() => {
      handleBotResponse(greeting, realisticPartner);
    }, 1500);
  };

  const handleBotResponse = (text: string, currentPartner: ChatPartner) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMessage: Message = {
        id: Date.now().toString(),
        sender_id: currentPartner.id,
        content: text,
        created_at: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1200);
  };

  const endChat = () => {
    setPartner(null);
    setMessages([]);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
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
            onClick={endChat}
            className="px-5 h-11 bg-pink-50 text-pink-primary rounded-2xl font-bold text-sm hover:bg-pink-100 transition-all active:scale-95 border border-pink-200"
          >
            Leave
          </button>
        )}
      </header>

      {/* Main Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {!searching && !partner && (
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
              onClick={findPartner}
              className="px-10 py-5 pink-gradient text-white rounded-2xl font-bold text-xl shadow-xl shadow-pink-200 flex items-center gap-3"
            >
              <span>Find Partner</span>
              <RefreshCcw size={24} />
            </motion.button>
          </div>
        )}

        {searching && (
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
                  {user?.gender === 'Male' ? (
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
        )}

        {partner && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
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
                      msg.sender_id === user?.id ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={msg.sender_id === user?.id ? "chat-bubble-user" : "chat-bubble-partner"}>
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
            </div>

            {/* Input Bar */}
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 pink-gradient text-white flex items-center justify-center rounded-xl disabled:opacity-50 transition-all shadow-md active:scale-90"
                >
                  <Send size={16} className="rotate-[15deg]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Safety Alert (Basic) */}
      <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-2 text-amber-600 text-[10px] font-bold">
        <AlertCircle size={14} />
        <span>REPORT ABUSE IF NEEDED • BE RESPECTFUL</span>
      </div>
    </div>
  );
}
