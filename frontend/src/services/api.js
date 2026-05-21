const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:3000";

const fetchJson = async (url, options) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Request gagal: ${response.status}`);
    }
    return response.json();
};

const mapLeaderboard = (entries, gameLabel) =>
    entries.map((entry, index) => ({
        rank: entry.rank ?? index + 1,
        uuid: entry.uuid,
        username: entry.playerName || entry.username || entry.uuid,
        game: gameLabel,
        trophy: Number(entry.score) || 0,
    }));

const unwrapLeaderboardResponse = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }
    return Array.isArray(payload?.data) ? payload.data : [];
};

const getLeaderboardBest = async (limit = 150) => {
    const url = limit ? `${BASE_URL}/zombierush/leaderboard/best?limit=${limit}` : `${BASE_URL}/zombierush/leaderboard/best`;
    const data = await fetchJson(url);
    return unwrapLeaderboardResponse(data);
};

const getLeaderboardTotal = async (limit = 150) => {
    const url = limit ? `${BASE_URL}/zombierush/leaderboard/total?limit=${limit}` : `${BASE_URL}/zombierush/leaderboard/total`;
    const data = await fetchJson(url);
    return unwrapLeaderboardResponse(data);
};

export async function getStats() {
    try {
        const best = await getLeaderboardBest();
        const top = best[0];
        return {
            topPlayer: top ? top.playerName || top.username : "Belum ada data",
            topTrophy: top ? top.score : 0,
            liveMatches: 0,
            totalPlayers: best.length,
        };
    } catch (error) {
        console.log(error);
        return {
            topPlayer: "Belum ada data",
            topTrophy: 0,
            liveMatches: 0,
            totalPlayers: 0,
        };
    }
}

export async function getLeaderboard() {
    const data = await getLeaderboardBest();
    return mapLeaderboard(data, "Zombie Rush");
}

export async function getPlayers() {
    const data = await getLeaderboardBest();
    return data.map((entry) => ({
        uuid: entry.uuid,
        username: entry.playerName || entry.username || entry.uuid
    }));
}

export async function getPlayerProfile(uuid) {
    let targetUuid = uuid;
    if (!targetUuid) {
        const best = await getLeaderboardBest(1);
        targetUuid = best[0]?.uuid;
    }
    if (!targetUuid) {
        return null;
    }

    const player = await fetchJson(`${BASE_URL}/zombierush/player/${encodeURIComponent(targetUuid)}`);
    const best = await getLeaderboardBest(200);
    const rankIndex = best.findIndex((entry) => entry.uuid === targetUuid);
    const rank = rankIndex >= 0 ? rankIndex + 1 : "-";

    return {
        uuid: player.uuid,
        username: player.playerName || player.username || player.uuid,
        game: "Zombie Rush",
        rank,
        bestScore: player.bestScore,
        totalScore: player.totalScore,
        totalKills: player.totalKills,
        totalMatches: player.totalMatches,
        averageScore: player.averageScore,
        lastPlayedAt: player.lastPlayedAt,
        history: [
            `Best Score: ${player.bestScore}`,
            `Total Score: ${player.totalScore}`,
            `Total Kill: ${player.totalKills}`,
            `Total Match: ${player.totalMatches}`,
            `Rata-rata skor: ${player.averageScore}`,
        ],
    };
}

export async function getMinecraftLeaderboard() {
    const data = await getLeaderboardBest();
    return mapLeaderboard(data, "Zombie Rush");
}

export async function getRobloxLeaderboard() {
    const response = await fetch(`${BASE_URL}/othergame/scores`);
    if (!response.ok) throw new Error("Gagal mengambil leaderboard Rock Paper Scissors");
    return response.json();
}

export async function simulateMatch(matchData) {
    return {
        success: true,
        message: `Simulasi: ${matchData.player1} melawan ${matchData.player2} berhasil dijalankan.`
    };
}