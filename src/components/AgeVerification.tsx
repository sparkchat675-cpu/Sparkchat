import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

export default function AgeVerification({ onVerify }: { onVerify: () => void }) {
  return (
    <div className="h-screen w-screen bg-pink-gradient flex items-center justify-center p-6 text-white overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-pink-primary shadow-xl">
            <ShieldCheck size={40} />
          </div>
        </div>
        
        <h1 className="text-3xl font-display font-bold mb-4">Are you 18+?</h1>
        <p className="text-white/80 mb-8 leading-relaxed">
          SparkChat is a platform for adults. By entering, you confirm you are at least 18 years old and agree to our terms.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={onVerify}
            className="w-full py-4 bg-white text-pink-primary font-bold rounded-2xl hover:bg-pink-50 transition-colors shadow-lg active:scale-95"
          >
            I am 18+ Enter Now
          </button>
          
          <button
            onClick={() => window.location.href = 'https://www.google.com'}
            className="w-full py-2 text-white/60 text-sm hover:text-white transition-colors"
          >
            I am younger, take me away
          </button>
        </div>
      </motion.div>
    </div>
  );
}
