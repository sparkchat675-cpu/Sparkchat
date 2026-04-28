import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Heart, ShieldAlert, Filter, UserPlus, RefreshCcw, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

type ActiveUser = {
  id: string;
  name: string;
  username?: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  country: string;
  avatar_url: string;
  is_online: boolean;
};

export default function ActiveUsersPage() {
  const { user, loginGoogle } = useAuth();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [filterGender, setFilterGender] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const activeCount = useState(() => Math.floor(Math.random() * 1001) + 4000)[0];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .neq('id', user?.id || '')
          .order('is_online', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setActiveUsers(data as ActiveUser[]);
        } else {
          // Fallback to mocks if no users in DB yet
          const mockUsers: ActiveUser[] = [
            { id: '1', name: 'Riya', gender: 'Female', age: 21, country: 'India', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riya', is_online: true },
            { id: '2', name: 'Aman', gender: 'Male', age: 24, country: 'India', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aman', is_online: true },
            { id: '3', name: 'Sophie', gender: 'Female', age: 22, country: 'UK', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie', is_online: true },
            { id: '4', name: 'Jake', gender: 'Male', age: 25, country: 'USA', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jake', is_online: true },
          ];
          setActiveUsers(mockUsers);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
    
    // Subscribe to changes
    const channel = supabase.channel('active-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchUsers)
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filteredUsers = activeUsers.filter(u => {
    const matchesGender = filterGender === 'All' || u.gender === filterGender;
    const matchesSearch = (u.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGender && matchesSearch;
  });

  const sendFriendRequest = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation(); // Prevent card click
    
    if (!user?.is_google_user) {
      alert("Please sign in with Google to add friends!");
      return;
    }

    if (pendingRequests.has(targetId)) return;

    try {
      setPendingRequests(prev => new Set(prev).add(targetId));
      
      const { error } = await supabase
        .from('friendships')
        .insert({
          sender_id: user.id,
          receiver_id: targetId,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          alert("Friend request already exists!");
        } else {
          throw error;
        }
      } else {
        alert("Friend request sent!");
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
      alert("Failed to send friend request. Please try again.");
      setPendingRequests(prev => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };

  if (!user || !user.is_google_user) {
    return (
      <div className="h-full flex flex-col bg-slate-50 items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-6">
          <Heart className="text-pink-primary" size={48} />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Join the Spark</h2>
        <p className="text-slate-500 mb-8 max-w-xs">
          Only verified users can see who's online. Sign in with Google to join the community!
        </p>
        <button 
          onClick={async () => {
             await loginGoogle();
          }}
          className="w-full max-w-xs h-14 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          <span>Login with Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <header className="h-16 px-6 bg-white border-b border-pink-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
           <h1 className="font-display font-bold text-xl text-pink-primary">Active Souls</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              if (navigator.share) {
                await navigator.share({
                  title: 'SparkChat',
                  text: 'Come chat with me on SparkChat!',
                  url: window.location.origin
                });
              } else {
                navigator.clipboard.writeText(window.location.origin);
                alert("Link copied!");
              }
            }}
            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-2"
          >
            <Share2 size={18} />
            <span className="text-[10px] font-bold uppercase hidden sm:block">Invite</span>
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="p-2 text-slate-400 hover:text-pink-primary hover:bg-pink-50 rounded-xl transition-all"
          >
            <RefreshCcw size={20} />
          </button>
          <div className="flex px-3 py-1.5 bg-green-50 border border-green-100 rounded-full items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{activeCount}</span>
          </div>
        </div>
      </header>

      <div className="p-4 bg-white border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search username, name or country..."
            className="w-full h-11 pl-11 pr-4 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-primary/20 text-sm font-medium"
          />
        </div>
        
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex-shrink-0 p-2 bg-slate-100 rounded-lg text-slate-500">
            <Filter size={16} />
          </div>
          {['All', 'Male', 'Female', 'Other'].map(g => (
            <button
              key={g}
              onClick={() => setFilterGender(g)}
              className={cn(
                "flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                filterGender === g 
                  ? "bg-pink-primary text-white shadow-md shadow-pink-100" 
                  : "bg-white border border-slate-200 text-slate-500 hover:border-pink-200"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-30">
            <RefreshCw className="animate-spin mb-4" />
            <p className="font-bold text-sm">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredUsers.map((u) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  alert(`Sparks flying for ${u.name}! Send them a message in chat.`);
                }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 group cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img src={u.avatar_url} alt={u.name} className="w-16 h-16 rounded-2xl bg-slate-50 object-cover border border-slate-100" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-slate-800 truncate">{u.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                      {u.age}
                    </span>
                  </div>
                  {u.username && (
                    <p className="text-[10px] font-bold text-pink-primary mb-1">@{u.username}</p>
                  )}
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                    {u.country} • {u.gender}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <button 
                      onClick={(e) => sendFriendRequest(e, u.id)}
                      disabled={pendingRequests.has(u.id)}
                      className={cn(
                        "flex-1 h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                        pendingRequests.has(u.id)
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-pink-light text-pink-primary hover:bg-pink-primary hover:text-white"
                      )}
                    >
                      {pendingRequests.has(u.id) ? (
                        <>
                          <RefreshCcw size={14} className="animate-spin" />
                          <span>Pending</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("User reported/blocked.");
                      }}
                      className="w-9 h-9 border border-slate-100 text-slate-400 rounded-lg flex items-center justify-center hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <ShieldAlert size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="font-bold">No users match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <div className={cn("text-pink-primary", className)}>
      <RefreshCcw size={32} />
    </div>
  );
}
