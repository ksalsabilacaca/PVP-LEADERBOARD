const BASE_URL = "http://localhost:3000";

const mcPayloads = [
  { uuid: "c0000000-0000-0000-0000-000000000001", playerName: "Skychord", score: 1850, kills: 42, durationSeconds: 300, endReason: "survived" },
  { uuid: "c0000000-0000-0000-0000-000000000002", playerName: "Hydromium", score: 1720, kills: 38, durationSeconds: 310, endReason: "survived" },
  { uuid: "c0000000-0000-0000-0000-000000000003", playerName: "Xenov1a", score: 2500, kills: 60, durationSeconds: 320, endReason: "survived" },
  { uuid: "c0000000-0000-0000-0000-000000000004", playerName: "alktin", score: 3000, kills: 99, durationSeconds: 330, endReason: "survived" },
  { uuid: "c0000000-0000-0000-0000-000000000005", playerName: "Logious", score: 1600, kills: 30, durationSeconds: 340, endReason: "survived" },
  { uuid: "c0000000-0000-0000-0000-000000000006", playerName: "Patootsky", score: 2800, kills: 85, durationSeconds: 350, endReason: "survived" },
  { uuid: "c0000000-0000-0000-0000-000000000007", playerName: "RebelApe", score: 2990, kills: 95, durationSeconds: 360, endReason: "survived" },
  { uuid: "c0000000-0000-0000-0000-000000000008", playerName: "Yashaa", score: 1450, kills: 25, durationSeconds: 370, endReason: "survived" },
  { uuid: "c0000000-0000-0000-0000-000000000009", playerName: "Floppy", score: 1900, kills: 48, durationSeconds: 380, endReason: "survived" },
  { uuid: "c0000000-0000-0000-0000-000000000010", playerName: "Kento", score: 1350, kills: 20, durationSeconds: 390, endReason: "survived" }
];

const rpsPayloads = [
  { username: "IlikePeople", score: 1050 },
  { username: "StupidTrain", score: 1100 },
  { username: "Fireworks", score: 950 },
  { username: "DemonBlade", score: 1200 },
  { username: "YummySocks", score: 1010 },
  { username: "OomfieDoofie", score: 1150 },
  { username: "ChibixLoli", score: 1300 },
  { username: "Xylo", score: 880 },
  { username: "Bacon", score: 1025 },
  { username: "Narwhal", score: 1075 }
];

async function sendRequest(url, body, label) {
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    const duration = performance.now() - start;
    const json = await res.json();
    return {
      success: res.ok,
      status: res.status,
      duration: Math.round(duration),
      playerName: body.playerName || body.username,
      label,
      message: json.message || json.error || 'No message returned'
    };
  } catch (err) {
    const duration = performance.now() - start;
    return {
      success: false,
      status: 'ERR',
      duration: Math.round(duration),
      playerName: body.playerName || body.username,
      label,
      message: err.message
    };
  }
}

async function run() {
  console.log("Sending API Requests to: " + BASE_URL);
  console.log("--------------------------------------------------------------------------------");

  const mcPromises = mcPayloads.map(p =>
    sendRequest(
      `${BASE_URL}/api/zombierush/match-result`,
      { ...p, playedAt: new Date().toISOString() },
      "Minecraft (Redis)"
    )
  );

  const rpsPromises = rpsPayloads.map(p =>
    sendRequest(
      `${BASE_URL}/api/othergame/scores`,
      p,
      "Rock-Paper-Scissors (PostgreSQL)"
    )
  );

  const allResults = await Promise.all([...mcPromises, ...rpsPromises]);

  console.log("\nSummary:\n");
  console.table(
    allResults.map(r => ({
      "Game/DB": r.label,
      "Player Name": r.playerName,
      "Status": r.status,
      "Success": r.success ? "✅" : "❌",
      "Latency (ms)": r.duration
    }))
  );

  const mcResults = allResults.filter(r => r.label === "Minecraft (Redis)");
  const rpsResults = allResults.filter(r => r.label === "Rock-Paper-Scissors (PostgreSQL)");

  const mcAvg = mcResults.reduce((acc, curr) => acc + curr.duration, 0) / mcResults.length;
  const rpsAvg = rpsResults.reduce((acc, curr) => acc + curr.duration, 0) / rpsResults.length;

  console.log("--------------------------------------------------------------------------------");
  console.log(`Average Latency:`);
  console.log(`Minecraft (Redis):               ${mcAvg.toFixed(1)} ms`);
  console.log(`Rock-Paper-Scissors (PostgreSQL):   ${rpsAvg.toFixed(1)} ms`);
  console.log("--------------------------------------------------------------------------------");
}

run();
