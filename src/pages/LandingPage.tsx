import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { loginGoogle } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="h-[60%] pink-gradient relative flex flex-col items-center justify-center text-white px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center rotate-12 shadow-[0_20px_50px_rgba(255,77,141,0.3)] relative group">
              <div className="absolute inset-0 bg-pink-primary/10 rounded-[2.5rem] animate-pulse"></div>
              <Heart size={56} className="text-pink-primary -rotate-12 fill-pink-primary" />
              <Sparkles size={28} className="absolute top-4 right-4 text-pink-300 -rotate-12 animate-bounce" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl font-display font-bold text-center leading-tight tracking-tighter"
          >
            Spark <br /> <span className="text-pink-100 italic">Chat</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-white/80 text-center max-w-xs font-medium"
          >
            Connect with amazing people worldwide in real-time. Spark a conversation!
          </motion.p>
          
          {/* Waves */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white rounded-t-[3rem]"></div>
        </div>

        {/* Content Section */}
        <div className="flex-1 bg-white px-8 pt-4 pb-12 flex flex-col justify-between">
          <div className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={loginGoogle}
              className="w-full h-14 flex items-center justify-center gap-3 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>Continue with Google</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/onboarding')}
              className="w-full h-14 bg-pink-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-200 hover:bg-pink-dark transition-colors"
            >
              <span>Join as Guest</span>
              <ArrowRight size={20} />
            </motion.button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-slate-400">
              By joining, you agree to our{' '}
              <Link to="/terms" className="text-pink-primary font-bold hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-pink-primary font-bold hover:underline">
                Privacy Policy
              </Link>
            </p>
            <p className="text-[10px] text-slate-300 italic">
              Guest chats are temporary and not stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
