"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Trophy, Users, Zap, Flame, BrainCircuit, Globe, Target, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { socket } from "@/lib/socket";

import { useRouter } from "next/navigation";

const CATEGORIES = [
  { id: "1", name: "General Knowledge", icon: Globe, color: "from-blue-500 to-cyan-400", activePlayers: 1205 },
  { id: "2", name: "Science & Tech", icon: BrainCircuit, color: "from-purple-500 to-indigo-400", activePlayers: 843 },
  { id: "3", name: "Pop Culture", icon: Zap, color: "from-pink-500 to-rose-400", activePlayers: 1530 },
  { id: "4", name: "History", icon: Target, color: "from-amber-500 to-orange-400", activePlayers: 420 },
];

export default function Home() {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [matchFound, setMatchFound] = useState<{ matchId: string, opponentId: string } | null>(null);

  useEffect(() => {
    socket.connect();

    socket.on("match_found", (data) => {
      setIsSearching(false);
      setMatchFound(data);
    });

    return () => {
      socket.off("match_found");
      socket.disconnect();
    };
  }, []);

  const handlePlayNow = () => {
    setIsSearching(true);
    // Mock user data for now
    socket.emit("join_matchmaking", {
      userId: "user_" + Math.floor(Math.random() * 1000),
      categoryId: "1", // Default to General Knowledge for demo
      eloRating: 1200
    });
  };

  return (
    <main className="min-h-screen pt-20 pb-12 px-6 flex flex-col items-center">
      <AnimatePresence>
        {matchFound && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-panel p-12 rounded-3xl text-center border-brand-500/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-brand-500/20 animate-pulse" />
              <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-6 relative z-10" />
              <h2 className="text-4xl font-bold mb-4 relative z-10">Match Found!</h2>
              <p className="text-xl text-slate-300 relative z-10">Get ready to battle.</p>
              <button 
                onClick={() => router.push(`/game/${matchFound.matchId}`)} 
                className="mt-8 px-8 py-3 bg-brand-600 hover:bg-brand-500 transition-colors rounded-xl font-bold relative z-10"
              >
                Enter Arena
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-brand-500/30">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-brand-100">Season 5 is Live! Double XP Weekend</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Master the <span className="text-gradient">Trivia</span> Arena
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Challenge your friends in real-time battles, climb the global leaderboards, and prove your knowledge across hundreds of dynamic categories.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayNow}
            disabled={isSearching}
            className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] disabled:opacity-70"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
            {isSearching ? "Searching..." : "Play Now"}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-white/5 text-white rounded-2xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Create Room
          </motion.button>
        </div>
      </motion.div>

      {/* Categories Discovery */}
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-brand-400" />
            Trending Categories
          </h2>
          <button className="text-sm text-brand-400 hover:text-brand-300 font-medium">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category, idx) => {
            const Icon = category.icon;
            const isHovered = hoveredId === category.id;
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onHoverStart={() => setHoveredId(category.id)}
                onHoverEnd={() => setHoveredId(null)}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="glass-panel p-6 rounded-3xl h-full flex flex-col relative overflow-hidden border-white/5 group-hover:border-brand-500/30 transition-colors duration-300">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br", category.color)}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400 mt-auto">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {category.activePlayers.toLocaleString()} playing
                    </span>
                  </div>

                  {/* Micro-interaction highlight */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center"
                      >
                        <Play className="w-4 h-4 text-white fill-current ml-1" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </main>
  );
}
