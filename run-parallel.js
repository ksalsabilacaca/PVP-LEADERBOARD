const BASE_URL = "https://minpro-sbd3.live";

// Words lists for coherent username generation
const prefixes = [
  "Arc", "Astral", "Blitz", "Brave", "Cipher", "Crimson", "Dusk", "Echo",
  "Ember", "Fable", "Feral", "Flux", "Frost", "Gale", "Glitch", "Grim",
  "Halo", "Havoc", "Ion", "Jade", "Karma", "Lumen", "Mirage", "Nexus",
  "Nova", "Onyx", "Phantom", "Prime", "Pulse", "Rift", "Rune", "Sable",
  "Solar", "Specter", "Storm", "Tempest", "Titan", "Viper", "Void", "Zen"
];

const suffixes = [
  "Blade", "Breaker", "Cipher", "Crusader", "Dancer", "Drifter", "Enigma", "Fang",
  "Forge", "Glider", "Harbinger", "Hawk", "Hunter", "Invoker", "Keeper", "Lancer",
  "Monk", "Nomad", "Oracle", "Outrider", "Paladin", "Phantom", "Ranger", "Raptor",
  "Reaper", "Rogue", "Samurai", "Sentinel", "Shade", "Shifter", "Slayer", "Vanguard",
  "Warden", "Whisper", "Wizard", "Wraith"
];

function generateRandomName() {
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const s = suffixes[Math.floor(Math.random() * suffixes.length)];
  const num = Math.floor(Math.random() * 900) + 100; // Append random 3-digit number (100-999)
  return `${p}${s}${num}`;
}

function generateUniqueNames(count) {
  const names = new Set();
  while (names.size < count) {
    names.add(generateRandomName());
  }
  return Array.from(names);
}

function generateUUID(index) {
  // Generates clean, unique dummy UUIDs: c0000000-0000-0000-0000-000000000001 to c0000000-0000-0000-0000-000000000050
  const hex = index.toString(16).padStart(12, '0');
  return `c0000000-0000-0000-0000-${hex}`;
}

// Generate 50 unique items for each game
const RECORD_COUNT = 50;
const mcNames = generateUniqueNames(RECORD_COUNT);
const rpsNames = generateUniqueNames(RECORD_COUNT);

const mcPayloads = mcNames.map((name, index) => ({
  uuid: generateUUID(index + 1),
  playerName: name,
  score: Math.floor(Math.random() * 2500) + 500, // Scores between 500 and 3000
  kills: Math.floor(Math.random() * 95) + 5,      // Kills between 5 and 100
  durationSeconds: Math.floor(Math.random() * 400) + 200,
  endReason: Math.random() > 0.2 ? "survived" : "dead"
}));

const rpsPayloads = rpsNames.map(name => ({
  username: name,
  score: Math.floor(Math.random() * 2500) + 500 // Scores between 500 and 3000
}));

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
  console.log(`Firing ${RECORD_COUNT * 2} Parallel API Requests (50 Minecraft + 50 RPS) to: ${BASE_URL}`);
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
      "Rock-Paper-Scissors (MongoDB)"
    )
  );

  // Run all 100 requests in parallel
  const allResults = await Promise.all([...mcPromises, ...rpsPromises]);

  console.log("\nExecution Summary (First 15 entries shown for preview):\n");
  console.table(
    allResults.slice(0, 15).map(r => ({
      "Game/DB": r.label,
      "Player Name": r.playerName,
      "Status": r.status,
      "Success": r.success ? "YES" : "NO",
      "Latency (ms)": r.duration
    }))
  );
  console.log(`... and ${allResults.length - 15} more entries.`);

  // Calculate Metrics
  const mcResults = allResults.filter(r => r.label === "Minecraft (Redis)");
  const rpsResults = allResults.filter(r => r.label === "Rock-Paper-Scissors (MongoDB)");

  const mcAvg = mcResults.reduce((acc, curr) => acc + curr.duration, 0) / mcResults.length;
  const rpsAvg = rpsResults.reduce((acc, curr) => acc + curr.duration, 0) / rpsResults.length;

  const mcSuccess = mcResults.filter(r => r.success).length;
  const rpsSuccess = rpsResults.filter(r => r.success).length;

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`Final Benchmark Results (${RECORD_COUNT} concurrent writes per DB):`);
  console.log(`Minecraft (Redis):               Avg: ${mcAvg.toFixed(1)} ms | Success: ${mcSuccess}/${RECORD_COUNT}`);
  console.log(`Rock-Paper-Scissors (MongoDB):   Avg: ${rpsAvg.toFixed(1)} ms | Success: ${rpsSuccess}/${RECORD_COUNT}`);
  console.log("--------------------------------------------------------------------------------");
}

run();