const BASE_URL = "http://localhost:3000";

export async function getStats() { //kalo udah ada backend:  const response = await fetch( `${BASE_URL}/stats`); return response.json();

  return {
    topPlayer: "DragonX",
    topTrophy: 5420,
    liveMatches: 128,
    totalPlayers: 12540,
  };

}

export async function getLeaderboard() { //kalo udah ada backend:    const response = await fetch(`${BASE_URL}/leaderboard`); return response.json();
  return [
    {
      rank: 1,
      username: "DragonX",
      game: "Minecraft",
      trophy: 5420,
    },
    {
      rank: 2,
      username: "ShadowNinja",
      game: "Roblox",
      trophy: 5310,
    },
    {
      rank: 3,
      username: "StevePro",
      game: "Minecraft",
      trophy: 5200,
    },
  ];
}

export async function getPlayers() { //kalo udah ada backend: const response = await fetch(`${BASE_URL}/players`); return response.json();
    return [
        {
            username: "DragonX",
        },
        {
            username: "ShadowNinja",
        },
        {
            username: "StevePro",
        },
        {
            username: "BlockMaster",
        },
    ];
}

export async function getPlayerProfile(username) { //kalo udah ada backend: const response = await fetch(`${BASE_URL}/player/${username}`); return response.json();
    return {
        username: username,
        game: "Minecraft",
        rank: 1,
        trophy: 5420,
        wins: 231,
        losses: 52,
        country: "Indonesia",

        history: [
            "Victory vs ShadowNinja (+30 Trophy)",
            "Victory vs BlockMaster (+25 Trophy)",
            "Reached Global Rank #1",
            "Won Roblox Arena Match",
        ],
    };
}

export async function getMinecraftLeaderboard() { //kalo udah ada backend: const response = await fetch(`${BASE_URL}/leaderboard/minecraft`); return response.json();
    return [
        {
            rank: 1,
            username: "DragonX",
            trophy: 5420,
        },
        {
            rank: 2,
            username: "StevePro",
            trophy: 5200,
        },
        {
            rank: 3,
            username: "BlockMaster",
            trophy: 5000,
        },
    ];

}

export async function getRobloxLeaderboard() { //kalo udah ada backend: const response = await fetch(`${BASE_URL}/leaderboard/roblox`); return response.json();
    return [
        {
            rank: 1,
            username: "ShadowNinja",
            trophy: 5310,
        },
        {
            rank: 2,
            username: "NoobHunter",
            trophy: 5100,
        },
        {
            rank: 3,
            username: "PixelWarrior",
            trophy: 4980,
        },
    ];
}

export async function simulateMatch(matchData) { //kalo udah ada backend: const response = await fetch(`${BASE_URL}/simulate-match`), {method: "POST", headers: {"Content-Type": "application/json",}, body: JSON.stringify(matchData),}}; return response.json();
    return {
        success: true,

        message:
            `${matchData.player1} defeated ${matchData.player2} (+30 Trophy)`
    };

}