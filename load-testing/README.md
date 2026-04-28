# Stress Testing Guide

To ensure our Node.js and Redis real-time infrastructure doesn't crash under pressure, we use **Artillery** to blast the WebSocket endpoints with concurrent users.

## Prerequisites
Ensure your backend and Redis are running locally before starting the test:
1. Start Redis: `redis-server`
2. Start Backend: `cd ../backend && npm run start`

## Running the Stress Test

You don't need to globally install Artillery. Simply run:
```bash
npx artillery run stress-test.yml
```

## What This Script Does
1. **Ramps up load:** Gradually adds 5 to 25 new users per second.
2. **Sustained load:** Keeps slamming the server with users for 60 seconds.
3. **Behavior:** Each simulated user connects via Socket.io, emits a `join_matchmaking` event (inserting them into the Redis ZSET), and then runs a loop simulating answering 5 questions.

## Success Metrics to Look For:
- **`vusers.completed`**: Should match `vusers.created` (No dropped connections).
- **`engine.socketio.emit`**: High throughput of events successfully fired.
- **`errors`**: We want to see **0 errors**. If we see `ECONNREFUSED` or timeouts, our Node.js event loop is blocked, and we will need to implement Redis Pub/Sub scaling across multiple Node instances.
