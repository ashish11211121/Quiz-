const matchmaking = require('./matchmaking');
const game = require('./game');
const { redisClient } = require('../config/redis');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join Matchmaking Queue
    socket.on('join_matchmaking', async (data) => {
      const { userId, categoryId, eloRating } = data;
      await matchmaking.joinQueue(socket, io, userId, categoryId, eloRating);
    });

    socket.on('join_game', (data) => {
      socket.join(data.matchId);
      console.log(`Socket ${socket.id} joined room ${data.matchId}`);
    });

    socket.on('submit_answer', async (data) => {
      await game.submitAnswer(io, socket, data);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
