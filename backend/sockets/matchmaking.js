const { redisClient } = require('../config/redis');
const { v4: uuidv4 } = require('uuid');
const game = require('./game');

const joinQueue = async (socket, io, userId, categoryId, eloRating) => {
  const queueKey = `matchmaking:1v1:${categoryId}`;
  
  await redisClient.zAdd(queueKey, {
    score: eloRating,
    value: JSON.stringify({ userId, socketId: socket.id, eloRating })
  });

  console.log(`User ${userId} joined queue for category ${categoryId} with ELO ${eloRating}`);

  await checkForMatch(io, queueKey, categoryId);
};

const checkForMatch = async (io, queueKey, categoryId) => {
  const waitingUsers = await redisClient.zRangeWithScores(queueKey, 0, 1);
  
  if (waitingUsers.length >= 2) {
    const p1 = JSON.parse(waitingUsers[0].value);
    const p2 = JSON.parse(waitingUsers[1].value);

    if (Math.abs(p1.eloRating - p2.eloRating) <= 100) {
      const matchId = uuidv4();
      
      await redisClient.zRem(queueKey, waitingUsers[0].value);
      await redisClient.zRem(queueKey, waitingUsers[1].value);

      const gameStateKey = `game:${matchId}`;
      await redisClient.hSet(gameStateKey, {
        status: 'starting',
        categoryId,
        currentQuestionIndex: -1,
        player1_userId: p1.userId,
        player1_socket: p1.socketId,
        player1_score: 0,
        player2_userId: p2.userId,
        player2_socket: p2.socketId,
        player2_score: 0
      });

      io.to(p1.socketId).emit('match_found', { matchId, opponentId: p2.userId });
      io.to(p2.socketId).emit('match_found', { matchId, opponentId: p1.userId });

      console.log(`Match ${matchId} started between ${p1.userId} and ${p2.userId}`);
      
      setTimeout(async () => {
        await game.handleNextRound(io, matchId, gameStateKey);
      }, 3000);
    }
  }
};

module.exports = { joinQueue };
