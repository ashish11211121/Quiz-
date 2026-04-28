"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GameRoom() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId;

  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<any>(null);
  const [gameOver, setGameOver] = useState<any>(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_game", { matchId });

    socket.on("next_question", (data) => {
      setCurrentQuestion(data.question);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setTimeLeft(15);
    });

    socket.on("score_update", (data) => {
      setScores({ player1: data.player1_score, player2: data.player2_score });
    });

    socket.on("answer_result", (data) => {
      setAnswerResult(data);
    });

    socket.on("game_over", (data) => {
      setGameOver(data);
    });

    return () => {
      socket.off("next_question");
      socket.off("score_update");
      socket.off("answer_result");
      socket.off("game_over");
    };
  }, [matchId]);

  useEffect(() => {
    if (timeLeft > 0 && currentQuestion && selectedAnswer === null) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && selectedAnswer === null) {
        handleAnswer(null);
    }
  }, [timeLeft, currentQuestion, selectedAnswer]);

  const handleAnswer = (index: number | null) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index !== null ? index : -1);
    
    const timeTaken = (15 - timeLeft) * 1000;
    
    socket.emit("submit_answer", {
      matchId,
      userId: "user_mock", // Default to mock, in production context is used
      answerIndex: index,
      timeTaken
    });
  };

  if (gameOver) {
      return (
          <div className="min-h-screen bg-[#0a0514] text-white flex flex-col items-center justify-center pt-20 px-4">
              <Trophy className="w-24 h-24 text-yellow-400 mb-8" />
              <h1 className="text-6xl font-bold mb-4">Game Over!</h1>
              <div className="flex gap-12 text-2xl mb-12">
                  <div className="text-center">
                      <p className="text-slate-400 mb-2">You</p>
                      <p className="font-bold text-blue-400">{gameOver.player1_score}</p>
                  </div>
                  <div className="text-center">
                      <p className="text-slate-400 mb-2">Opponent</p>
                      <p className="font-bold text-red-400">{gameOver.player2_score}</p>
                  </div>
              </div>
              <button 
                onClick={() => router.push('/')}
                className="px-8 py-4 bg-brand-600 rounded-xl font-bold hover:bg-brand-500 transition-colors"
              >
                  Return to Lobby
              </button>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-[#0a0514] text-white flex flex-col items-center pt-20 px-4 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-96 bg-brand-900/20 rounded-full blur-3xl -z-10" />

      <header className="w-full max-w-4xl flex justify-between items-center mb-12 glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-white/20" />
          <div>
            <p className="font-bold">You</p>
            <p className="text-sm text-blue-400">Score: {scores.player1}</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center border-brand-500 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            <span className="text-2xl font-bold font-mono">{timeLeft}</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 tracking-widest uppercase">Time Left</span>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="font-bold">Opponent</p>
            <p className="text-sm text-red-400">Score: {scores.player2}</p>
          </div>
          <div className="w-12 h-12 bg-red-500 rounded-full border-2 border-white/20" />
        </div>
      </header>

      {currentQuestion ? (
        <motion.main 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl flex flex-col items-center"
        >
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 leading-tight">
            {currentQuestion.text}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {currentQuestion.options.map((option: string, idx: number) => {
                let btnStateClass = "border-white/20 hover:bg-brand-900/40 hover:border-brand-500";
                
                if (answerResult) {
                    if (idx === answerResult.correctAnswerIndex) {
                        btnStateClass = "bg-green-500/20 border-green-500 text-green-100";
                    } else if (idx === selectedAnswer && !answerResult.isCorrect) {
                        btnStateClass = "bg-red-500/20 border-red-500 text-red-100";
                    } else {
                        btnStateClass = "opacity-50 border-white/10";
                    }
                } else if (selectedAnswer === idx) {
                    btnStateClass = "bg-brand-600 border-brand-400";
                }

                return (
                <motion.button
                    key={idx}
                    whileHover={{ scale: answerResult ? 1 : 1.02 }}
                    whileTap={{ scale: answerResult ? 1 : 0.98 }}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                        "w-full p-6 glass-panel text-xl font-medium rounded-2xl transition-all text-left flex justify-between items-center group",
                        btnStateClass
                    )}
                >
                    {option}
                    <div className={cn(
                        "w-6 h-6 rounded-full border-2 transition-colors",
                        answerResult && idx === answerResult.correctAnswerIndex ? "border-green-500 bg-green-500" :
                        answerResult && idx === selectedAnswer ? "border-red-500 bg-red-500" :
                        "border-white/20"
                    )} />
                </motion.button>
                )
            })}
            </div>

            <AnimatePresence>
                {answerResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "mt-12 text-2xl font-bold px-8 py-4 rounded-xl",
                            answerResult.isCorrect ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
                        )}
                    >
                        {answerResult.isCorrect ? `+${answerResult.scoreGained} Points!` : "Incorrect"}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.main>
      ) : (
          <div className="flex flex-col items-center justify-center flex-1">
              <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-8" />
              <h2 className="text-2xl font-bold animate-pulse">Get Ready...</h2>
          </div>
      )}

      <div className="fixed bottom-8 flex gap-4">
        <button className="p-4 glass-panel rounded-full hover:bg-white/10 transition-colors">
          <Zap className="w-6 h-6 text-yellow-400" />
        </button>
        <button className="p-4 glass-panel rounded-full hover:bg-white/10 transition-colors">
          <Timer className="w-6 h-6 text-blue-400" />
        </button>
      </div>
    </div>
  );
}
