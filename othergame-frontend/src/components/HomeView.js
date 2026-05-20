"use client";

export default function HomeView({
  username,
  setUsername,
  leaderboard,
  loadingLeaderboard,
  fetchLeaderboard,
  onStartMatchmaking,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Find Match Panel */}
      <div className="lg:col-span-5 glass-card rounded-3xl p-6 md:p-8 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          🎮 Start playing
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Enter your username to enter the matchmaking queue. Win matches to score +100 points, or earn +30 points for defeat. Keep climbing!
        </p>

        <form onSubmit={onStartMatchmaking} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username-input" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Enter Username
            </label>
            <input
              id="username-input"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. PlayerOne"
              className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-700/60 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold"
            />
          </div>
          <button
            type="submit"
            disabled={!username.trim()}
            className={`w-full py-4 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
              username.trim()
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/30"
            }`}
          >
            ⚔️ FIND MATCH
          </button>
        </form>
      </div>

      {/* Leaderboard Panel */}
      <div className="lg:col-span-7 glass-card rounded-3xl p-6 md:p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            🏆 Global Leaderboard
          </h2>
          <button
            onClick={fetchLeaderboard}
            disabled={loadingLeaderboard}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition"
            title="Refresh Leaderboard"
          >
            <svg className={`w-5 h-5 ${loadingLeaderboard ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
          {loadingLeaderboard && leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg className="w-8 h-8 animate-spin mb-3 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading rankings...</span>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No matches recorded yet.</p>
              <p className="text-sm mt-1">Be the first to secure a spot on the board!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.map((item, index) => {
                const isTop3 = index < 3;
                const badgeColors = [
                  "bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-950 font-black", // Gold
                  "bg-gradient-to-r from-slate-300 to-gray-400 text-gray-950 font-black",  // Silver
                  "bg-gradient-to-r from-amber-600 to-orange-700 text-white font-black", // Bronze
                ];

                return (
                  <div
                    key={item.value + index}
                    className={`flex items-center justify-between p-4 rounded-2xl transition border ${
                      item.value.toLowerCase() === username.trim().toLowerCase()
                        ? "bg-indigo-950/40 border-indigo-500/50"
                        : "bg-gray-950/30 border-gray-800/40 hover:border-gray-700/60"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        isTop3 ? badgeColors[index] : "bg-gray-800/50 text-gray-400 font-semibold"
                      }`}>
                        {index + 1}
                      </span>
                      <span className={`font-semibold ${
                        item.value.toLowerCase() === username.trim().toLowerCase()
                          ? "text-indigo-400"
                          : "text-gray-200"
                      }`}>
                        {item.value}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-indigo-300">
                      {item.score} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
