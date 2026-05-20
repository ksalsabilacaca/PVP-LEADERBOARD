"use client";

export default function ResultView({
  playerScore,
  aiScore,
  pointsGained,
  finalScore,
  submittingScore,
  scoreStatus,
  onReplay,
}) {
  const wonMatch = playerScore > aiScore;
  const isDraw = playerScore === aiScore;

  return (
    <div className="glass-card rounded-3xl p-8 max-w-xl mx-auto w-full text-center flex flex-col items-center justify-center">
      {wonMatch ? (
        <div className="mb-6 flex flex-col items-center">
          {/* Gold Trophy */}
          <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-5xl mb-4 animate-bounce">
            🏆
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-amber-400 tracking-wider drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] uppercase">
            Victory!
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            You conquered the arena against AlphaRPS
          </p>
        </div>
      ) : isDraw ? (
        <div className="mb-6 flex flex-col items-center">
          {/* Balanced Scale / Handshake */}
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center text-5xl mb-4 animate-pulse">
            🤝
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-indigo-400 tracking-wider drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] uppercase">
            Match Draw
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            An evenly matched battle against AlphaRPS
          </p>
        </div>
      ) : (
        <div className="mb-6 flex flex-col items-center">
          {/* Skull / Defeat Indicator */}
          <div className="w-24 h-24 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-5xl mb-4 animate-pulse">
            💀
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-rose-500 tracking-wider drop-shadow-[0_0_15px_rgba(244,63,94,0.5)] uppercase">
            Defeat
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            AlphaRPS simulated a perfect counter strategy
          </p>
        </div>
      )}

      {/* Scoreboard Statistics Summary */}
      <div className="w-full bg-gray-950/40 rounded-2xl border border-gray-900 p-4 md:p-6 mb-6 flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm border-b border-gray-800/60 pb-3">
          <span className="text-gray-500 font-semibold">Match Results</span>
          <span className="font-mono text-gray-200 font-bold">
            {playerScore} wins - {aiScore} losses
          </span>
        </div>
        <div className="flex justify-between items-center text-sm border-b border-gray-800/60 pb-3">
          <span className="text-gray-500 font-semibold">Points Gained</span>
          <span className="font-mono text-emerald-400 font-bold">
            +{pointsGained} pts
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-semibold">New Total Score</span>
          <span className="font-mono text-indigo-400 font-bold">
            {finalScore} pts
          </span>
        </div>
      </div>

      {/* Database Sync Status */}
      <div className="w-full py-3 px-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-sm flex items-center justify-center gap-3 mb-8">
        {submittingScore ? (
          <>
            <svg className="w-4 h-4 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-indigo-300 font-semibold">{scoreStatus}</span>
          </>
        ) : (
          <>
            <span className="text-emerald-400 font-bold">✓</span>
            <span className="text-indigo-300 font-semibold">{scoreStatus || "Score synchronization complete!"}</span>
          </>
        )}
      </div>

      {/* Replay action */}
      <button
        onClick={onReplay}
        className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition duration-200 w-full md:w-auto md:px-12 cursor-pointer"
      >
        Play Another Match ⚔️
      </button>
    </div>
  );
}
