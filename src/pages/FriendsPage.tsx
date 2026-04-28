import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Search, MessageCircle, MoreHorizontal, UserCheck, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

type Friend = {
  id: string;
  friendshipId: string;
  name: string;
  status: 'pending' | 'accepted';
  avatar_url: string;
  lastMessage?: string;
  isOnline: boolean;
  isIncoming?: boolean;
};

export default function FriendsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchFriends = async () => {
      setLoading(true);
      try {
        // Fetch friendships
        const { data, error } = await supabase
          .from('friendships')
          .select(`
            id,
            status,
            sender_id,
            receiver_id,
            users:sender_id (id, name, avatar_url, is_online),
            receiver:receiver_id (id, name, avatar_url, is_online)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (error) throw error;

        const formattedFriends: Friend[] = data.map((f: any) => {
          const isSender = f.sender_id === user.id;
          const otherUser = isSender ? f.receiver : f.users;
          return {
            id: otherUser.id,
            friendshipId: f.id,
            name: otherUser.name,
            status: f.status,
            avatar_url: otherUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`,
            isOnline: otherUser.is_online,
            isIncoming: !isSender && f.status === 'pending'
          };
        });

        setFriends(formattedFriends);
      } catch (err) {
        console.error("Error fetching friends:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();

    // Subscribe to changes
    const channel = supabase
      .channel('friendships-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
        fetchFriends();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);
      
      if (error) throw error;
      alert("Friend request accepted!");
    } catch (err) {
      console.error(err);
      alert("Failed to accept request.");
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);
      
      if (error) throw error;
    } catch (err) {
      console.error(err);
    }
  };

  if (!user?.is_google_user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-pink-primary shadow-xl mb-6 border border-pink-50">
          <Heart size={40} fill="currentColor" />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Google sign-in required</h2>
        <p className="text-slate-400 mb-8 max-w-xs font-medium">
          Friends and persistent chats are only available for Google-verified users to ensure safety.
        </p>
        <button className="px-8 py-4 bg-pink-primary text-white rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-dark transition-all">
          Connect Google Account
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <header className="h-16 px-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-display font-bold text-xl pink-text-gradient">Friends</h1>
        <button className="p-2 text-slate-400 hover:text-pink-primary transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </header>

      <div className="p-4 bg-white border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search friends..."
            className="w-full h-11 pl-11 pr-4 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-primary/20 text-sm font-medium"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {friends.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {friends.map((friend) => (
              <motion.div
                key={friend.id}
                whileTap={{ backgroundColor: '#fff0f5' }}
                onClick={() => friend.status === 'accepted' && navigate(`/dm/${friend.id}`)}
                className="p-4 bg-white flex items-center gap-4 transition-colors cursor-pointer group"
              >
                <div className="relative">
                  <img src={friend.avatar_url} alt={friend.name} className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100" />
                  {friend.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-slate-800 truncate">{friend.name}</h3>
                    <span className="text-[10px] text-slate-400 font-medium tracking-tighter">2m ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-0.5">
                    {friend.status === 'accepted' ? (
                      <p className="text-xs text-slate-400 truncate pr-4">{friend.lastMessage || 'Start a conversation!'}</p>
                    ) : (
                      <div className="flex items-center gap-1 text-pink-primary font-bold text-[10px] uppercase">
                        <Clock size={12} />
                        <span>Pending Request</span>
                      </div>
                    )}
                    
                    {friend.status === 'accepted' && (
                      <div className="w-2 h-2 bg-pink-primary rounded-full"></div>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {friend.status === 'accepted' ? (
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-pink-light group-hover:text-pink-primary transition-all">
                      <MessageCircle size={20} />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                       {friend.isIncoming ? (
                         <>
                           <button 
                             onClick={() => handleAcceptRequest(friend.friendshipId)}
                             className="w-10 h-10 bg-pink-primary text-white rounded-lg flex items-center justify-center shadow-lg shadow-pink-100 hover:bg-pink-dark transition-all"
                           >
                             <UserCheck size={20} />
                           </button>
                           <button 
                             onClick={() => handleRejectRequest(friend.friendshipId)}
                             className="w-10 h-10 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-all"
                           >
                             <LogOut size={18} className="rotate-45" />
                           </button>
                         </>
                       ) : (
                         <div className="flex items-center gap-1 text-slate-300 text-[10px] font-bold uppercase">
                           <span>Sent</span>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <Heart size={48} className="mb-4 opacity-10" />
            <p className="font-bold">No friends yet</p>
            <p className="text-xs max-w-[150px] text-center mt-2">Active users tab is a great place to meet people!</p>
          </div>
        )}
      </div>
    </div>
  );
}
