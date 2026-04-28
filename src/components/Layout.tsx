import { Outlet, NavLink } from 'react-router-dom';
import { MessageCircle, Users, Heart, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function Layout() {
  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>

      <nav className="shrink-0 h-20 bg-white border-t border-pink-100 flex items-center justify-around px-2 shadow-[0_-2px_10px_rgba(255,77,141,0.05)] z-50 safe-area-inset-bottom">
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full transition-colors relative ${
              isActive ? 'text-pink-primary' : 'text-slate-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <motion.div animate={{ scale: isActive ? 1.1 : 1 }}>
                <MessageCircle size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'rgba(255,153,204,0.1)' : 'none'} />
              </motion.div>
              <span className="text-[10px] mt-1 font-bold uppercase tracking-widest">Chat</span>
              {isActive && (
                <motion.div 
                  layoutId="nav-dot"
                  className="absolute bottom-2 w-1.5 h-1.5 bg-pink-primary rounded-full"
                />
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/active"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full transition-colors relative ${
              isActive ? 'text-pink-primary' : 'text-slate-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <motion.div animate={{ scale: isActive ? 1.1 : 1 }}>
                <Users size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'rgba(255,153,204,0.1)' : 'none'} />
              </motion.div>
              <span className="text-[10px] mt-1 font-bold uppercase tracking-widest">Active</span>
              {isActive && (
                <motion.div 
                  layoutId="nav-dot"
                  className="absolute bottom-2 w-1.5 h-1.5 bg-pink-primary rounded-full"
                />
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/friends"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full transition-colors relative ${
              isActive ? 'text-pink-primary' : 'text-slate-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <motion.div animate={{ scale: isActive ? 1.1 : 1 }}>
                <Heart size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'rgba(255,153,204,0.1)' : 'none'} />
              </motion.div>
              <span className="text-[10px] mt-1 font-bold uppercase tracking-widest">Friends</span>
              {isActive && (
                <motion.div 
                  layoutId="nav-dot"
                  className="absolute bottom-2 w-1.5 h-1.5 bg-pink-primary rounded-full"
                />
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full transition-colors relative ${
              isActive ? 'text-pink-primary' : 'text-slate-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <motion.div animate={{ scale: isActive ? 1.1 : 1 }}>
                <User size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'rgba(255,153,204,0.1)' : 'none'} />
              </motion.div>
              <span className="text-[10px] mt-1 font-bold uppercase tracking-widest">Profile</span>
              {isActive && (
                <motion.div 
                  layoutId="nav-dot"
                  className="absolute bottom-2 w-1.5 h-1.5 bg-pink-primary rounded-full"
                />
              )}
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
