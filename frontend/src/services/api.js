const BASE_URL = "http://localhost:3000/api";

export async function getStats() {
  const response = await fetch(`${BASE_URL}/stats`);
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

export async function getLeaderboard() {
  const response = await fetch(`${BASE_URL}/leaderboard`);
  if (!response.ok) throw new Error("Failed to fetch leaderboard");
  return response.json();
}

export async function getPlayers() {
  const response = await fetch(`${BASE_URL}/players`);
  if (!response.ok) throw new Error("Failed to fetch players");
  return response.json();
}

export async function getPlayerProfile(username) {
  const response = await fetch(`${BASE_URL}/player/${username}`);
  if (!response.ok) throw new Error("Failed to fetch player profile");
  return response.json();
}

export async function getMinecraftLeaderboard() {
  const response = await fetch(`${BASE_URL}/minecraft/scores`);
  if (!response.ok) throw new Error("Failed to fetch Minecraft leaderboard");
  const data = await response.json();
  // Map backend format (value/score) to frontend format (username/trophy)
  return data.map((item, index) => ({
    rank: index + 1,
    username: item.value,
    game: "Minecraft",
    trophy: item.score,
  }));
}

export async function getRobloxLeaderboard() {
  const response = await fetch(`${BASE_URL}/othergame/scores`);
  if (!response.ok) throw new Error("Failed to fetch Roblox leaderboard");
  const data = await response.json();
  // Map backend format (value/score) to frontend format (username/trophy)
  return data.map((item, index) => ({
    rank: index + 1,
    username: item.value,
    game: "Roblox",
    trophy: item.score,
  }));
}

export async function simulateMatch(matchData) {
  const response = await fetch(`${BASE_URL}/simulate-match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(matchData),
  });
  if (!response.ok) throw new Error("Failed to simulate match");
  return response.json();
}