import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { generateBotResponse } from '../services/aiService';
import { ChatHeader } from '../components/chat/ChatHeader';

// Components that are always needed or very small
const ChatMessages = lazy(() => import('../components/chat/ChatMessages').then(m => ({ default: m.ChatMessages })));
const ChatInput = lazy(() => import('../components/chat/ChatInput').then(m => ({ default: m.ChatInput })));
const ChatMatchmaking = lazy(() => import('../components/chat/ChatMatchmaking').then(m => ({ default: m.ChatMatchmaking })));
const ChatEmptyState = lazy(() => import('../components/chat/ChatEmptyState').then(m => ({ default: m.ChatEmptyState })));

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

  const handleSendMessage = async () => {
    if (!inputText.trim() || !partner) return;
    
    const userMsg = inputText.toLowerCase();
    
    const badWords = ['fuck', 'shit', 'bitch', 'asshole', 'fuk', 'motherfucker'];
    const hasBadWords = badWords.some(word => userMsg.includes(word));
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
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
          id: crypto.randomUUID(),
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

        const typingDuration = 1200 + Math.random() * 2500;
        
        setTimeout(() => {
          setIsTyping(false);
          const botMessage: Message = {
            id: crypto.randomUUID(),
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
    
    await supabase.from('users').update({ status: 'searching', current_partner_id: null }).eq('id', user.id);
    
    const startTime = Date.now();
    const maxSearchTime = 8000 + Math.random() * 2000;
    
    const pollForPartner = async () => {
      try {
        const targetGender = user.gender === 'Male' ? 'Female' : (user.gender === 'Female' ? 'Male' : 'Other');
        
        const { data: realUsers, error } = await supabase
          .from('users')
          .select('*')
          .eq('gender', targetGender)
          .eq('status', 'searching')
          .neq('id', user.id)
          .limit(1);

        if (!error && realUsers && realUsers.length > 0) {
          const matchedUser = realUsers[0];
          
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

    const found = await pollForPartner();
    if (!found) {
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
        id: crypto.randomUUID(),
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
      <ChatHeader partner={partner} onEndChat={endChat} />

      <div className="flex-1 overflow-hidden relative flex flex-col">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
          {!searching && !partner && (
            <ChatEmptyState onFindPartner={findPartner} />
          )}

          {searching && (
            <ChatMatchmaking userGender={user?.gender} />
          )}

          {partner && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <ChatMessages 
                messages={messages} 
                isTyping={isTyping} 
                userId={user?.id} 
                scrollRef={scrollRef} 
              />
              <ChatInput 
                inputText={inputText} 
                setInputText={setInputText} 
                onSendMessage={handleSendMessage} 
              />
            </div>
          )}
        </Suspense>
      </div>

      <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-2 text-amber-600 text-[10px] font-bold">
        <AlertCircle size={14} />
        <span>REPORT ABUSE IF NEEDED • BE RESPECTFUL</span>
      </div>
    </div>
  );
}

