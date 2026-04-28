import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Image as ImageIcon, ChevronLeft, MoreHorizontal, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

type Partner = {
  id: string;
  name: string;
  avatar_url: string;
  is_online: boolean;
  country: string;
};

export default function DMChatPage() {
  const { friendId } = useParams<{ friendId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !friendId) return;

    const fetchPartner = async () => {
      const { data } = await supabase.from('users').select('*').eq('id', friendId).single();
      if (data) setPartner(data);
    };

    const fetchMessages = async () => {
      // Check if blocked first
      const { data: blockedData } = await supabase
        .from('blocks')
        .select('*')
        .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${friendId}),and(blocker_id.eq.${friendId},blocked_id.eq.${user.id})`);
      
      if (blockedData && blockedData.length > 0) {
        setIsBlocked(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    };

    fetchPartner();
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat_${user.id}_${friendId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}` 
      }, (payload) => {
        const newMessage = payload.new as Message;
        if (newMessage.sender_id === friendId) {
          setMessages(prev => [...prev, newMessage]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, friendId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || !user || !friendId) return;

    const newMessage = {
      sender_id: user.id,
      receiver_id: friendId,
      content: inputText.trim()
    };

    const { data, error } = await supabase.from('messages').insert(newMessage).select().single();

    if (!error && data) {
      setMessages(prev => [...prev, data]);
      setInputText('');
    }
  };

  const handleBlock = async () => {
    if (!user || !friendId) return;
    if (!confirm("Are you sure you want to block this user?")) return;

    try {
      const { error } = await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: friendId });
      if (error) throw error;
      alert("User blocked.");
      navigate('/friends');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center p-8">Loading chat...</div>;
  if (isBlocked) return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
      <AlertCircle size={48} className="text-red-400 mb-4" />
      <h2 className="text-xl font-bold text-slate-800">Chat Unavailable</h2>
      <p className="text-slate-500 mt-2">You have blocked this user or they have blocked you.</p>
      <button onClick={() => navigate('/friends')} className="mt-6 px-6 py-2 bg-pink-primary text-white rounded-xl font-bold">Go Back</button>
    </div>
  );
  if (!partner) return <div className="h-full flex items-center justify-center p-8">Partner not found.</div>;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="h-16 flex items-center px-4 border-b border-slate-100 gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-pink-primary">
          <ChevronLeft size={24} />
        </button>
        <div className="relative">
          <img src={partner.avatar_url} className="w-10 h-10 rounded-full border border-slate-100" />
          {partner.is_online && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-slate-800 truncate">{partner.name}</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
            {partner.is_online ? 'Active Now' : 'Offline'}
          </p>
        </div>
        <button onClick={handleBlock} className="p-2 text-slate-300 hover:text-red-500">
          <MoreHorizontal size={20} />
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50">
        <div className="flex justify-center mb-8">
          <div className="px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
            <Shield size={14} className="text-green-500" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">End-to-end encrypted</span>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={cn(
                "flex",
                msg.sender_id === user?.id ? "justify-end" : "justify-start"
              )}
            >
              <div 
                className={cn(
                  "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium",
                  msg.sender_id === user?.id 
                    ? "bg-pink-primary text-white rounded-tr-none shadow-md shadow-pink-100" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm"
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
        <button className="p-2 text-slate-400 hover:text-pink-primary transition-colors">
          <ImageIcon size={22} />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="w-full h-11 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-pink-primary/20 text-sm font-medium"
          />
          <button 
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 pink-gradient text-white flex items-center justify-center rounded-lg shadow-md disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
