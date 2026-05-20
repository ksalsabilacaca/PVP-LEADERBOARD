const { performance } = require('node:perf_hooks');
const { zombieRushRedis } = require('../database/database');
const realtime = require('../realtime');

const REDIS_PREFIX = process.env.ZOMBIERUSH_REDIS_PREFIX || 'zombierush';

const playerKey = (uuid) => `${REDIS_PREFIX}:player:${uuid}`;
const bestKey = () => `${REDIS_PREFIX}:leaderboard:best`;
const totalKey = () => `${REDIS_PREFIX}:leaderboard:total`;

const parseNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const requireApiKey = (req, res) => {
  const expected = process.env.ZOMBIERUSH_API_KEY;
  if (!expected) return true;
  const provided = req.header('x-api-key');
  if (provided !== expected) {
    res.status(401).json({ error: 'API key tidak valid.' });
    return false;
  }
  return true;
};

const recordMatch = async (req, res) => {
  if (!requireApiKey(req, res)) return;

  const { uuid, playerName, score, kills, durationSeconds, endReason, playedAt } = req.body;
  const scoreNumber = parseNumber(score, NaN);
  const killsNumber = parseNumber(kills, NaN);
  const durationNumber = parseNumber(durationSeconds, NaN);

  if (!uuid || !playerName || !Number.isFinite(scoreNumber) || !Number.isFinite(killsNumber)
    || !Number.isFinite(durationNumber) || !endReason) {
    return res.status(400).json({
      error: 'Payload tidak valid. Wajib: uuid, playerName, score (number), kills (number), durationSeconds (number), endReason (string).'
    });
  }

  try {
    const current = await zombieRushRedis.hGetAll(playerKey(uuid));
    const bestScore = Math.max(parseNumber(current.bestScore), scoreNumber);
    const totalScore = parseNumber(current.totalScore) + scoreNumber;
    const totalKills = parseNumber(current.totalKills) + killsNumber;
    const totalMatches = parseNumber(current.totalMatches) + 1;
    const averageScore = totalScore / totalMatches;
    const lastPlayedAt = playedAt ? new Date(playedAt).toISOString() : new Date().toISOString();

    const payload = {
      uuid,
      playerName,
      username: playerName,
      bestScore: String(bestScore),
      totalScore: String(totalScore),
      totalKills: String(totalKills),
      totalMatches: String(totalMatches),
      averageScore: averageScore.toFixed(2),
      lastPlayedAt,
      lastDurationSeconds: String(durationNumber),
      lastEndReason: String(endReason)
    };

    const pipeline = zombieRushRedis.multi();
    pipeline.hSet(playerKey(uuid), payload);
    pipeline.zAdd(bestKey(), [{ score: bestScore, value: uuid }]);
    pipeline.zAdd(totalKey(), [{ score: totalScore, value: uuid }]);
    await pipeline.exec();

    realtime.broadcast('update', { game: 'minecraft' });

    return res.status(200).json({
      message: 'Data match berhasil disimpan.',
      data: {
        uuid,
        playerName,
        username: playerName,
        bestScore,
        totalScore,
        totalKills,
        totalMatches,
        averageScore: Number(averageScore.toFixed(2)),
        lastPlayedAt,
        lastDurationSeconds: durationNumber,
        lastEndReason: String(endReason)
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal menyimpan data ke Redis.' });
  }
};

const getLeaderboard = async (req, res, type) => {
  const limit = Math.max(1, Math.min(100, parseNumber(req.query.limit, 10)));
  const key = type === 'total' ? totalKey() : bestKey();
  const scoreField = type === 'total' ? 'totalScore' : 'bestScore';
  const totalStart = performance.now();
  const queryStart = performance.now();

  try {
    const uuids = await zombieRushRedis.zRange(key, 0, limit - 1, { REV: true });
    const pipeline = zombieRushRedis.multi();
    uuids.forEach((uuid) => pipeline.hGetAll(playerKey(uuid)));
    const results = uuids.length ? await pipeline.exec() : [];
    const queryEnd = performance.now();
    const processStart = performance.now();

    const entries = uuids.map((uuid, index) => {
      const data = results[index] || {};
      const name = data.playerName || data.username || uuid;
      return {
        rank: index + 1,
        uuid,
        playerName: name,
        username: name,
        score: parseNumber(data[scoreField])
      };
    });

    const processEnd = performance.now();
    const metrics = {
      queryMs: Number((queryEnd - queryStart).toFixed(2)),
      processMs: Number((processEnd - processStart).toFixed(2)),
      totalMs: Number((processEnd - totalStart).toFixed(2)),
      source: 'Redis Sorted Set + Redis Player Data'
    };

    return res.status(200).json({ data: entries, metrics });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal mengambil leaderboard dari Redis.' });
  }
};

const getLeaderboardBest = (req, res) => getLeaderboard(req, res, 'best');
const getLeaderboardTotal = (req, res) => getLeaderboard(req, res, 'total');

const getPlayer = async (req, res) => {
  const uuid = req.params.uuid;
  if (!uuid) {
    return res.status(400).json({ error: 'UUID tidak valid.' });
  }

  try {
    const data = await zombieRushRedis.hGetAll(playerKey(uuid));
    if (!data || !data.uuid) {
      return res.status(404).json({ error: 'Player tidak ditemukan.' });
    }

    return res.status(200).json({
      uuid: data.uuid,
      playerName: data.playerName || data.uuid,
      bestScore: parseNumber(data.bestScore),
      totalScore: parseNumber(data.totalScore),
      totalKills: parseNumber(data.totalKills),
      totalMatches: parseNumber(data.totalMatches),
      averageScore: parseNumber(data.averageScore),
      lastPlayedAt: data.lastPlayedAt || null,
      lastDurationSeconds: parseNumber(data.lastDurationSeconds),
      lastEndReason: data.lastEndReason || null
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Gagal mengambil data player dari Redis.' });
  }
};

module.exports = {
  recordMatch,
  getLeaderboardBest,
  getLeaderboardTotal,
  getPlayer
};
