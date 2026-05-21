const { zombieRushRedis: redisClient, pgPool } = require('../database/database');
const realtime = require('../realtime');

// GET /api/stats
const getStats = async (req, res) => {
  try {
    // 1. Get Minecraft top player from Redis
    const mcScores = await redisClient.zRangeWithScores('leaderboard:minecraft', 0, 0, { REV: true });
    let mcTopPlayer = null;
    let mcTopTrophy = 0;
    if (mcScores && mcScores.length >= 1) {
      mcTopPlayer = mcScores[0].value;
      mcTopTrophy = mcScores[0].score;
    }

    // 2. Get Roblox top player from PostgreSQL
    const robloxTopRes = await pgPool.query(
      `SELECT username, score FROM othergame_scores ORDER BY score DESC LIMIT 1`
    );
    const robloxTopPlayerObj = robloxTopRes.rows[0];
    const robloxTopPlayer = robloxTopPlayerObj ? robloxTopPlayerObj.username : null;
    const robloxTopTrophy = robloxTopPlayerObj ? robloxTopPlayerObj.score : 0;

    // 3. Compare top players
    let topPlayer = "No Players Yet";
    let topTrophy = 0;
    if (mcTopTrophy >= robloxTopTrophy) {
      if (mcTopPlayer) {
        topPlayer = mcTopPlayer;
        topTrophy = mcTopTrophy;
      }
    } else {
      if (robloxTopPlayer) {
        topPlayer = robloxTopPlayer;
        topTrophy = robloxTopTrophy;
      }
    }

    // 4. Calculate total players across both databases
    const totalMinecraft = await redisClient.zCard('leaderboard:minecraft') || 0;
    const totalRobloxRes = await pgPool.query('SELECT COUNT(*) FROM othergame_scores');
    const totalRoblox = parseInt(totalRobloxRes.rows[0].count, 10) || 0;
    const totalPlayers = totalMinecraft + totalRoblox;

    // 5. Simulated live matches for premium feel
    const liveMatches = 100 + Math.floor(Math.sin(Date.now() / 10000) * 15);

    res.status(200).json({
      topPlayer,
      topTrophy,
      liveMatches,
      totalPlayers: totalPlayers > 0 ? totalPlayers : 4, // Default fallback if database is empty
    });
  } catch (error) {
    console.error("Error in getStats:", error);
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
};

// GET /api/leaderboard (Unified rankings)
const getLeaderboard = async (req, res) => {
  try {
    // Fetch Minecraft from Redis
    const mcScoresRaw = await redisClient.zRangeWithScores('leaderboard:minecraft', 0, 99, { REV: true });
    const mcList = [];
    if (mcScoresRaw) {
      for (const entry of mcScoresRaw) {
        mcList.push({
          username: entry.value,
          game: 'Minecraft',
          trophy: entry.score,
        });
      }
    }

    // Fetch Roblox from PostgreSQL
    const robloxRes = await pgPool.query(
      `SELECT username, score FROM othergame_scores ORDER BY score DESC LIMIT 100`
    );
    const robloxList = robloxRes.rows.map((s) => ({
      username: s.username,
      game: 'Rock Paper Scissors',
      trophy: s.score,
    }));

    // Merge and sort
    const unifiedList = [...mcList, ...robloxList]
      .sort((a, b) => b.trophy - a.trophy)
      .slice(0, 100)
      .map((player, index) => ({
        rank: index + 1,
        username: player.username,
        game: player.game,
        trophy: player.trophy,
      }));

    // If completely empty, return mock data to prevent a blank display
    if (unifiedList.length === 0) {
      return res.status(200).json([
        { rank: 1, username: "DragonX", game: "Minecraft", trophy: 5420 },
        { rank: 2, username: "ShadowNinja", game: "Rock Paper Scissors", trophy: 5310 },
        { rank: 3, username: "StevePro", game: "Minecraft", trophy: 5200 },
        { rank: 4, username: "BlockMaster", game: "Rock Paper Scissors", trophy: 5000 },
      ]);
    }

    res.status(200).json(unifiedList);
  } catch (error) {
    console.error("Error in getLeaderboard:", error);
    res.status(500).json({ error: 'Failed to build unified leaderboard' });
  }
};

// GET /api/players (Distinct username selection list for simulation dropdown)
const getPlayers = async (req, res) => {
  try {
    const mcPlayers = await redisClient.zRange('leaderboard:minecraft', 0, -1) || [];
    const robloxRes = await pgPool.query('SELECT username FROM othergame_scores');
    const robloxPlayers = robloxRes.rows.map((p) => p.username);

    // Merge distinct
    const allPlayers = Array.from(new Set([...mcPlayers, ...robloxPlayers]));

    // Seed defaults if empty so simulation remains usable
    if (allPlayers.length === 0) {
      return res.status(200).json([
        { username: "DragonX" },
        { username: "ShadowNinja" },
        { username: "StevePro" },
        { username: "BlockMaster" },
      ]);
    }

    res.status(200).json(allPlayers.map(username => ({ username })));
  } catch (error) {
    console.error("Error in getPlayers:", error);
    res.status(500).json({ error: 'Failed to retrieve players list' });
  }
};

// GET /api/player/:username (Profile and history details)
const getPlayerProfile = async (req, res) => {
  const { username } = req.params;

  try {
    // Try to find in Redis and PostgreSQL
    const mcScoreRaw = await redisClient.zScore('leaderboard:minecraft', username);
    const mcScore = mcScoreRaw !== null ? parseFloat(mcScoreRaw) : null;

    const robloxRes = await pgPool.query('SELECT score FROM othergame_scores WHERE username = $1', [username]);
    const robloxScoreObj = robloxRes.rows[0];
    const robloxScore = robloxScoreObj ? robloxScoreObj.score : null;

    if (mcScore === null && robloxScore === null) {
      // Return a default base profile instead of error to keep UI functional
      return res.status(200).json({
        username,
        game: "Minecraft",
        rank: 99,
        trophy: 0,
        wins: 0,
        losses: 0,
        country: "Global",
        history: ["Joined the PvP Arena"],
      });
    }

    const isMC = (mcScore || 0) >= (robloxScore || 0);
    const trophy = isMC ? mcScore : robloxScore;
    const game = isMC ? "Minecraft" : "Rock Paper Scissors";

    // Calculate Rank
    let rank = 1;
    if (isMC) {
      const rankIndex = await redisClient.zRevRank('leaderboard:minecraft', username);
      rank = rankIndex !== null ? rankIndex + 1 : 1;
    } else {
      const rankRes = await pgPool.query('SELECT COUNT(*) FROM othergame_scores WHERE score > $1', [trophy]);
      rank = parseInt(rankRes.rows[0].count, 10) + 1;
    }

    // Dynamic stats mapping
    const wins = Math.floor(trophy / 25) + 3;
    const losses = Math.max(0, Math.floor(trophy / 90) - 1);

    // Country logic derived from username or fallback
    const countries = ["Indonesia", "United States", "Japan", "Singapore", "Canada"];
    const countryIndex = username.charCodeAt(0) % countries.length;
    const country = countries[countryIndex];

    // Generate dynamic match history for maximum premium look
    const opponents = ["StevePro", "BlockMaster", "DragonX", "ShadowNinja", "NoobHunter", "PixelWarrior"];
    const filteredOpponents = opponents.filter(o => o.toLowerCase() !== username.toLowerCase());

    const history = [
      `Victory vs ${filteredOpponents[0 % filteredOpponents.length]} (+30 Trophy)`,
      `Victory vs ${filteredOpponents[1 % filteredOpponents.length]} (+25 Trophy)`,
      `Reached Global Rank #${rank}`,
      `Joined the Unified ${game} League`,
    ];

    res.status(200).json({
      username,
      game,
      rank,
      trophy,
      wins,
      losses,
      country,
      history,
    });
  } catch (error) {
    console.error("Error in getPlayerProfile:", error);
    res.status(500).json({ error: 'Failed to load player profile' });
  }
};

// POST /api/simulate-match (Simulate match results)
const simulateMatch = async (req, res) => {
  const { player1, player2, game } = req.body;

  if (!player1 || !player2) {
    return res.status(400).json({ error: "Requires player1 and player2" });
  }

  try {
    const pointsGained = 30;

    if (game && game.toLowerCase() === "minecraft") {
      // 1. Fetch current Minecraft score from Redis
      const scoreRaw = await redisClient.zScore('leaderboard:minecraft', player1);
      const currentScore = scoreRaw !== null ? parseFloat(scoreRaw) : 1000; // start at 1000 for nice rankings
      const newScore = currentScore + pointsGained;

      // 2. Save new score
      await redisClient.zAdd('leaderboard:minecraft', [{ score: newScore, value: player1 }]);

      // Ensure player 2 exists in database with at least basic score if they don't yet
      const p2ScoreRaw = await redisClient.zScore('leaderboard:minecraft', player2);
      if (p2ScoreRaw === null) {
        await redisClient.zAdd('leaderboard:minecraft', [{ score: 950, value: player2 }]);
      }

      // Broadcast update
      realtime.broadcast('update', { game: 'minecraft' });

      return res.status(200).json({
        success: true,
        message: `${player1} defeated ${player2} (+${pointsGained} Trophy) in Minecraft PvP Arena`,
      });
    } else {
      // 1. Fetch current Roblox score from PostgreSQL
      const playerRes = await pgPool.query('SELECT score FROM othergame_scores WHERE username = $1', [player1]);
      const playerObj = playerRes.rows[0];
      const currentScore = playerObj ? playerObj.score : 1000;
      const newScore = currentScore + pointsGained;

      // 2. Save new score
      await pgPool.query(
        `INSERT INTO othergame_scores (username, score)
         VALUES ($1, $2)
         ON CONFLICT (username)
         DO UPDATE SET score = EXCLUDED.score`,
        [player1, newScore]
      );

      // Ensure player 2 exists in database with basic score if not existing
      const p2Res = await pgPool.query('SELECT score FROM othergame_scores WHERE username = $1', [player2]);
      if (p2Res.rows.length === 0) {
        await pgPool.query(
          `INSERT INTO othergame_scores (username, score)
           VALUES ($1, $2)
           ON CONFLICT (username)
           DO NOTHING`,
          [player2, 950]
        );
      }

      // Broadcast update
      realtime.broadcast('update', { game: 'roblox' });

      return res.status(200).json({
        success: true,
        message: `${player1} defeated ${player2} (+${pointsGained} Trophy) in Rock Paper Scissors Arena`,
      });
    }
  } catch (error) {
    console.error("Error in simulateMatch:", error);
    res.status(500).json({ error: 'Failed to execute match simulation' });
  }
};

module.exports = {
  getStats,
  getLeaderboard,
  getPlayers,
  getPlayerProfile,
  simulateMatch,
};
