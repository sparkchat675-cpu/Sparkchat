import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Info } from 'lucide-react';

const countries = [
  { name: 'India', flag: '🇮🇳' },
  { name: 'Nepal', flag: '🇳🇵' },
  { name: 'Pakistan', flag: '🇵🇰' },
  { name: 'Bangladesh', flag: '🇧🇩' },
  { name: 'UK', flag: '🇬🇧' },
  { name: 'USA', flag: '🇺🇸' },
  { name: 'Other', flag: '🌍' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { loginTemporary, loginGoogle } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    age: 18,
    country: 'India',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim().length < 2) return;
    if (formData.age < 18) return;
    
    loginTemporary(formData);
    navigate('/chat');
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-y-auto">
      <header className="h-16 flex items-center px-4 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-500 hover:text-pink-primary transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="ml-2 font-display font-bold text-xl pink-text-gradient">Guest Login</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-6 flex-1 max-w-md mx-auto w-full space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-wider">Your Name</label>
            <input
              required
              type="text"
              placeholder="e.g. John Doe"
              className="w-full h-14 px-5 bg-white border-2 border-slate-100 rounded-2xl focus:border-pink-primary focus:outline-none transition-all shadow-sm font-medium"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-wider">Gender</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Male', 'Female', 'Other'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: g })}
                  className={`h-12 rounded-xl font-bold transition-all border-2 ${
                    formData.gender === g
                      ? 'bg-pink-primary border-pink-primary text-white shadow-lg shadow-pink-100'
                      : 'bg-white border-slate-100 text-slate-500 hover:border-pink-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-wider">Age (18+)</label>
            <input
              required
              type="number"
              min="18"
              max="100"
              className="w-full h-14 px-5 bg-white border-2 border-slate-100 rounded-2xl focus:border-pink-primary focus:outline-none transition-all shadow-sm font-medium"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-wider">Country</label>
            <div className="relative">
              <select
                className="w-full h-14 px-5 bg-white border-2 border-slate-100 rounded-2xl focus:border-pink-primary focus:outline-none transition-all shadow-sm font-medium appearance-none"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              >
                {countries.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronLeft size={20} className="-rotate-90" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3 text-blue-700">
          <Info className="flex-shrink-0 mt-0.5" size={20} />
          <p className="text-xs leading-relaxed">
            As a guest, your profile and chats will be deleted once you close the app. Sign in with Google to save your favorites!
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full h-14 bg-pink-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-pink-200 hover:bg-pink-dark transition-all mt-8"
        >
          Start Chatting
        </motion.button>

        <div className="flex items-center gap-4 py-4">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">or recommend</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <button
          type="button"
          onClick={async () => {
             await loginGoogle();
             navigate('/chat');
          }}
          className="w-full h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-700 hover:border-pink-200 transition-all shadow-sm active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          <span>Sync with Google</span>
        </button>
      </form>
    </div>
  );
}
