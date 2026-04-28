import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogOut, Settings, Shield, User as UserIcon, Camera, ChevronRight, Share2, Heart, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bio, setBio] = useState(user?.bio || '');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [isEditing, setIsEditing] = useState(false);
  const [newInterest, setNewInterest] = useState('');

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ bio, interests })
        .eq('id', user.id);
      
      if (error) throw error;
      alert("Profile updated!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const [stats, setStats] = React.useState({ friends: 0, sparks: 48, vibe: 92 });

  React.useEffect(() => {
    if (!user) return;
    
    const fetchStats = async () => {
      try {
        // Count accepted friendships
        const { count, error } = await supabase
          .from('friendships')
          .select('*', { count: 'exact', head: true })
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq('status', 'accepted');
        
        if (!error && count !== null) {
          setStats(prev => ({ ...prev, friends: count }));
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, [user]);

  if (!user) return null;

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto no-scrollbar">
      {/* Header Profile Card */}
      <div className="pink-gradient pt-12 pb-24 px-6 relative rounded-b-[3rem] shadow-xl">
        <div className="flex items-center justify-between text-white mb-8">
          <h1 className="font-display font-bold text-2xl">Profile</h1>
          <button className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
            <Settings size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl overflow-hidden">
              <img 
                src={user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'} 
                alt={user.name} 
                className="w-full h-full rounded-[2.2rem] object-cover"
              />
            </div>
            {user.is_google_user && (
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-pink-primary text-white rounded-2xl border-4 border-white flex items-center justify-center shadow-lg active:scale-95">
                <Camera size={18} />
              </button>
            )}
          </div>
          
          <h2 className="mt-4 text-2xl font-display font-bold text-white">{user.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
              {user.country} • {user.age} • {user.gender}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mx-6 -mt-12 bg-white rounded-3xl p-6 shadow-xl border border-pink-50 grid grid-cols-3 gap-4 text-center z-10">
        <div>
          <div className="text-xl font-display font-bold text-pink-primary">{stats.friends}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Friends</div>
        </div>
        <div className="border-x border-slate-100">
          <div className="text-xl font-display font-bold text-pink-primary">{stats.sparks}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Sparks</div>
        </div>
        <div>
          <div className="text-xl font-display font-bold text-pink-primary">{stats.vibe}%</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Vibe</div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Bio Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between ml-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">About Me</h3>
            <button 
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              className="text-[10px] font-bold text-pink-primary uppercase"
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 min-h-[100px]">
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                className="w-full h-24 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-pink-primary/30"
              />
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed italic">
                {bio || "No bio yet. Click edit to add one!"}
              </p>
            )}
          </div>
        </div>

        {/* Interests Section */}
        <div className="space-y-3">
          <h3 className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Interests</h3>
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <div key={interest} className="px-3 py-1.5 bg-pink-light text-pink-primary rounded-full text-xs font-bold flex items-center gap-1">
                  <span>{interest}</span>
                  {isEditing && (
                    <button onClick={() => removeInterest(interest)} className="hover:text-pink-dark">
                      <LogOut size={10} className="rotate-45" /> {/* Close icon substitute */}
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                    placeholder="Add..."
                    className="w-20 px-2 py-1 bg-slate-50 rounded-lg text-xs outline-none"
                  />
                  <button onClick={addInterest} className="text-pink-primary font-bold text-lg">+</button>
                </div>
              )}
              {interests.length === 0 && !isEditing && (
                <p className="text-xs text-slate-400">Add interests to find better matches</p>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Account</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
             {!user.is_google_user && (
               <div className="p-4 bg-pink-50 border-b border-pink-100 italic text-pink-600 text-[11px] font-medium flex items-center justify-between">
                 <span>Sync your data across devices</span>
                 <button 
                   onClick={() => navigate('/onboarding')} 
                   className="px-3 py-1 bg-pink-primary text-white rounded-lg not-italic font-bold"
                 >
                   Upgrade
                 </button>
               </div>
             )}
             <MenuButton icon={<Award size={20} className="text-amber-500" />} label="Premium Sparks" badge="Gold" />
             <MenuButton icon={<UserIcon size={20} className="text-blue-500" />} label="Edit Profile" />
             <MenuButton icon={<Heart size={20} className="text-pink-primary" />} label="My Favorites" />
             <MenuButton 
               icon={<Share2 size={20} className="text-indigo-500" />} 
               label="Invite Friends" 
               onClick={async () => {
                 if (navigator.share) {
                   try {
                     await navigator.share({
                       title: 'Join SparkChat!',
                       text: 'Hey! Check out this cool new dating app I found. Let\'s chat!',
                       url: window.location.origin,
                     });
                   } catch (err) {
                     console.log("Share failed", err);
                   }
                 } else {
                   try {
                     await navigator.clipboard.writeText(window.location.origin);
                     alert("App link copied to clipboard!");
                   } catch (err) {
                     console.error("Copy failed", err);
                   }
                 }
               }} 
             />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Safety & Legal</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
             <MenuButton icon={<Shield size={20} className="text-green-500" />} label="Privacy Policy" onClick={() => navigate('/privacy')} />
             <MenuButton icon={<Shield size={20} className="text-orange-500" />} label="Terms of Service" onClick={() => navigate('/terms')} />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full h-14 bg-white text-red-500 border border-red-50 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-red-50 transition-all mb-8"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, badge, onClick }: { icon: React.ReactNode, label: string, badge?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-50">
          {icon}
        </div>
        <span className="font-bold text-slate-700 text-sm tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-md text-[10px] font-bold uppercase">{badge}</span>}
        <ChevronRight size={18} className="text-slate-300" />
      </div>
    </button>
  );
}
