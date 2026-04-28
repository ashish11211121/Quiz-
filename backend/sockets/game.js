const { redisClient } = require('../config/redis');

const submitAnswer = async (io, socket, data) => {
  const { matchId, userId, answerIndex, timeTaken } = data;
  const gameStateKey = `game:${matchId}`;
  
  const gameState = await redisClient.hGetAll(gameStateKey);
  if (!gameState || !gameState.status) return;

  const correctAnswerIndex = parseInt(gameState.currentCorrectAnswerIndex);
  const isCorrect = answerIndex === correctAnswerIndex;
  
  let scoreGained = 0;
  if (isCorrect) {
    // 100 max points, drops based on time taken (max 15000ms)
    scoreGained = Math.floor(Math.max(10, 100 - (timeTaken / 15000) * 50));
  }

  // Identify player
  const playerKey = gameState.player1_userId === userId ? 'player1_score' : 'player2_score';
  await redisClient.hIncrBy(gameStateKey, playerKey, scoreGained);

  socket.emit('answer_result', { isCorrect, scoreGained, correctAnswerIndex });

  // Increment answer count
  const answersCountKey = `game:${matchId}:answers:${gameState.currentQuestionIndex}`;
  const answersCount = await redisClient.incr(answersCountKey);
  
  if (answersCount >= 2) {
    await handleNextRound(io, matchId, gameStateKey);
  }
};

const handleNextRound = async (io, matchId, gameStateKey) => {
  let currentIndex = parseInt(await redisClient.hGet(gameStateKey, 'currentQuestionIndex'));
  currentIndex += 1;
  
  const gameState = await redisClient.hGetAll(gameStateKey);
  io.to(matchId).emit('score_update', { 
    player1_score: gameState.player1_score, 
    player2_score: gameState.player2_score 
  });

  if (currentIndex >= 5) { // 5 Questions per match
    await endGame(io, matchId, gameStateKey);
  } else {
    await redisClient.hSet(gameStateKey, 'currentQuestionIndex', currentIndex);
    // Mock new question for demo purposes
    const nextQuestion = {
        text: `Round ${currentIndex + 1}: What is the capital of France?`,
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctIndex: 2
    };
    await redisClient.hSet(gameStateKey, 'currentCorrectAnswerIndex', nextQuestion.correctIndex);
    
    setTimeout(() => {
        io.to(matchId).emit('next_question', { question: nextQuestion, questionIndex: currentIndex });
    }, 2000); // 2 second pause between questions
  }
};

const endGame = async (io, matchId, gameStateKey) => {
    const gameState = await redisClient.hGetAll(gameStateKey);
    io.to(matchId).emit('game_over', { 
        player1_score: gameState.player1_score, 
        player2_score: gameState.player2_score 
    });
    
    await redisClient.del(gameStateKey);
    // To do: Write Elo changes and match history to MongoDB
};

module.exports = { submitAnswer, handleNextRound };
