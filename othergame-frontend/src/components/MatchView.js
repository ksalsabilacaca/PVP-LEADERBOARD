"use client";

// Move mappings
const MOVES = {
  rock: {
    name: "Rock",
    emoji: "✊",
    color: "from-orange-500 to-amber-600",
    glow: "shadow-orange-500/30",
    beats: "scissors",
    svg: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5c-3.58 0-6.5-2.92-6.5-6.5S8.42 5.5 12 5.5s6.5 2.92 6.5 6.5-2.92 6.5-6.5 6.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22M5.22 5.22l2.48 2.48M16.3l2.48 2.48M5.22 18.78l2.48-2.48M16.3 7.7l2.48-2.48" />
      </svg>
    )
  },
  paper: {
    name: "Paper",
    emoji: "✋",
    color: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/30",
    beats: "rock",
    svg: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  scissors: {
    name: "Scissors",
    emoji: "✌️",
    color: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/30",
    beats: "paper",
    svg: (
      <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.12 14.12L12 12m0 0L9.88 9.88M12 12L9.88 14.12M12 12l2.12-2.12M6 7a2 2 0 11-4 0 2 2 0 014 0zm0 10a2 2 0 11-4 0 2 2 0 014 0zm16-10a2 2 0 11-4 0 2 2 0 014 0zm0 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }
};

export default function MatchView({
  username,
  gameState,
  matchmakingProgress,
  round,
  playerScore,
  aiScore,
  playerChoice,
  aiChoice,
  roundResult,
  shaking,
  roundHistory,
  onPlayRound,
  onNextRound,
}) {
  // Render Matchmaking Panel
  if (gameState === "matchmaking") {
    return (
      <div className="glass-card rounded-3xl p-8 max-w-lg mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px]">
        {/* Radar Simulation */}
        <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-radar"></div>
          <div className="absolute inset-2 rounded-full border border-indigo-500/40 animate-radar [animation-delay:1s]"></div>
          <div className="absolute inset-6 rounded-full border border-indigo-500/60 animate-radar [animation-delay:2s]"></div>

          <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-2xl z-10 animate-pulse">
            🔍
          </div>

          {/* Spinning sweep arm */}
          <div className="absolute inset-0 border border-transparent border-t-indigo-500 rounded-full animate-radar-sweep pointer-events-none"></div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2 animate-glow">
          Searching for Battle...
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Matching player <strong className="text-indigo-400">{username}</strong> with opponent
        </p>

        <div className="w-full bg-gray-900/60 rounded-full h-2 overflow-hidden border border-gray-800">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${matchmakingProgress}%` }}
          ></div>
        </div>

        <span className="text-xs text-gray-500 font-mono mt-3">
          {matchmakingProgress < 100 ? `Status: PINGING HOSTS... ${matchmakingProgress}%` : "OPPONENT FOUND: ALPHARPS (AI)"}
        </span>
      </div>
    );
  }

  // Render Arena Panel
  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col gap-8 max-w-4xl mx-auto w-full">
      {/* Arena Header Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        {/* Player */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500 flex items-center justify-center font-bold text-indigo-300">
            {username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-gray-200 text-sm tracking-wide">{username}</h4>
            <span className="text-xs text-emerald-400 font-semibold">{playerScore} Round Wins</span>
          </div>
        </div>

        {/* Rounds status bar */}
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            Round {round} / 3
          </span>
          <div className="flex gap-2 mt-1">
            {[1, 2, 3].map((rNum) => {
              const played = roundHistory[rNum - 1];
              let indicatorClass = "bg-gray-800 border-gray-700 text-gray-600";
              let indicatorContent = rNum;

              if (played) {
                if (played.result === "win") {
                  indicatorClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                  indicatorContent = "✓";
                } else if (played.result === "loss") {
                  indicatorClass = "bg-rose-500/20 border-rose-500 text-rose-400 font-bold";
                  indicatorContent = "✗";
                } else {
                  indicatorClass = "bg-amber-500/20 border-amber-500 text-amber-400 font-bold";
                  indicatorContent = "=";
                }
              }

              return (
                <div
                  key={rNum}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all ${indicatorClass}`}
                >
                  {indicatorContent}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bot */}
        <div className="flex items-center gap-3 md:flex-row-reverse text-left md:text-right">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500 flex items-center justify-center font-bold text-purple-300 animate-pulse">
            AI
          </div>
          <div>
            <h4 className="font-bold text-gray-200 text-sm tracking-wide">AlphaRPS</h4>
            <span className="text-xs text-purple-400 font-semibold">{aiScore} Round Wins</span>
          </div>
        </div>
      </div>

      {/* Duel Ground */}
      <div className="flex-1 min-h-[220px] flex items-center justify-center relative bg-gray-950/20 rounded-2xl border border-gray-900/60 p-4">
        {/* Visual matchup overlay */}
        {!playerChoice ? (
          <div className="text-center py-8">
            <p className="text-lg font-semibold text-indigo-300 animate-pulse">
              Waiting for your move...
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Select Rock, Paper, or Scissors below to strike.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full max-w-md gap-4">
            {/* Player Hand */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                You Picked
              </span>
              <div className={`w-28 h-28 rounded-2xl bg-gradient-to-b ${MOVES[playerChoice].color} flex items-center justify-center text-4xl shadow-xl transition-all ${
                shaking ? "animate-shake-left" : "scale-100"
              }`}>
                {shaking ? "✊" : MOVES[playerChoice].emoji}
              </div>
              <span className="font-bold text-white mt-1">
                {shaking ? "..." : MOVES[playerChoice].name}
              </span>
            </div>

            {/* VS Divider */}
            <div className="flex flex-col items-center justify-center z-10">
              <span className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700/60 text-xs font-black text-gray-400 flex items-center justify-center">
                VS
              </span>
            </div>

            {/* AI Hand */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
                AI Picked
              </span>
              <div className={`w-28 h-28 rounded-2xl bg-gradient-to-b ${
                shaking || !aiChoice ? "from-purple-800 to-indigo-950" : MOVES[aiChoice].color
              } flex items-center justify-center text-4xl shadow-xl transition-all ${
                shaking ? "animate-shake-right" : "scale-100"
              }`}>
                {shaking || !aiChoice ? "✊" : MOVES[aiChoice].emoji}
              </div>
              <span className="font-bold text-white mt-1">
                {shaking || !aiChoice ? "..." : MOVES[aiChoice].name}
              </span>
            </div>
          </div>
        )}

        {/* Round Winner Banner */}
        {roundResult && !shaking && (
          <div className="absolute inset-0 bg-gray-950/80 rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-1">
              Round {round} Outcome
            </span>

            {roundResult === "win" && (
              <h3 className="text-3xl font-black text-emerald-400 tracking-wide drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                YOU WIN THE ROUND! 🎉
              </h3>
            )}
            {roundResult === "loss" && (
              <h3 className="text-3xl font-black text-rose-400 tracking-wide drop-shadow-[0_0_10px_rgba(251,113,133,0.3)]">
                AI WINS THE ROUND! ✗
              </h3>
            )}
            {roundResult === "draw" && (
              <h3 className="text-3xl font-black text-amber-400 tracking-wide drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                ROUND DRAW! =
              </h3>
            )}

            <button
              onClick={onNextRound}
              className="mt-5 px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition duration-200 cursor-pointer"
            >
              {round >= 3 ? "Reveal Match Results 🏁" : "Next Round ➔"}
            </button>
          </div>
        )}
      </div>

      {/* Input Selection Controls */}
      <div className={`flex flex-col md:flex-row justify-center gap-4 ${
        playerChoice ? "opacity-40 pointer-events-none" : "opacity-100"
      }`}>
        {Object.entries(MOVES).map(([key, move]) => (
          <button
            key={key}
            onClick={() => onPlayRound(key)}
            disabled={!!playerChoice}
            className="flex-1 glass-card-interactive rounded-2xl p-4 md:p-6 flex flex-col items-center gap-3 cursor-pointer select-none"
          >
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${move.color} flex items-center justify-center shadow-lg`}>
              {move.svg}
            </div>
            <div className="text-center">
              <span className="block font-bold text-gray-100 text-lg">{move.name}</span>
              <span className="text-xs text-gray-500 tracking-wider">Strike move</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
