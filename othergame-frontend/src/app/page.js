"use client";

import { useState, useEffect, useCallback } from "react";
import HomeView from "../components/HomeView";
import MatchView from "../components/MatchView";
import ResultView from "../components/ResultView";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export default function Home() {
  // Game state
  const [username, setUsername] = useState("");
  const [gameState, setGameState] = useState("lobby"); // lobby | matchmaking | arena | gameover

  // Game Match states
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [draws, setDraws] = useState(0);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [aiChoice, setAiChoice] = useState(null);
  const [roundResult, setRoundResult] = useState(null); // win | loss | draw | null
  const [shaking, setShaking] = useState(false);
  const [roundHistory, setRoundHistory] = useState([]);

  // Matchmaking simulation
  const [matchmakingProgress, setMatchmakingProgress] = useState(0);

  // Scoring & backend sync state
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreStatus, setScoreStatus] = useState("");
  const [pointsGained, setPointsGained] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [error, setError] = useState(null);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/othergame/scores`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard scores.");
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend server. Make sure the backend is running on port 3000.");
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Connect to SSE for real-time leaderboard updates
  useEffect(() => {
    const eventSource = new EventSource(`${BACKEND_URL}/api/scores/live`);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "update") {
          console.log("Realtime score update in othergame. Re-fetching...");
          fetchLeaderboard();
        }
      } catch (err) {
        console.error("Failed to parse live update message:", err);
      }
    };
    eventSource.onerror = (err) => {
      console.error("SSE connection error in othergame:", err);
    };
    return () => {
      eventSource.close();
    };
  }, [fetchLeaderboard]);

  // Matchmaking Simulation
  useEffect(() => {
    let interval;
    if (gameState === "matchmaking") {
      setMatchmakingProgress(0);
      interval = setInterval(() => {
        setMatchmakingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              // Transition to actual battle arena
              setGameState("arena");
              setRound(1);
              setPlayerScore(0);
              setAiScore(0);
              setDraws(0);
              setPlayerChoice(null);
              setAiChoice(null);
              setRoundResult(null);
              setRoundHistory([]);
            }, 800);
            return 100;
          }
          return prev + Math.floor(Math.random() * 20) + 10;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Handle play action
  const handlePlayRound = (choice) => {
    if (shaking || roundHistory.length >= 3) return;

    setPlayerChoice(choice);
    setShaking(true);
    setRoundResult(null);
    setAiChoice(null);

    // AI randomly chooses move
    const aiChoices = ["rock", "paper", "scissors"];
    const randomChoice = aiChoices[Math.floor(Math.random() * 3)];

    // Shaking duration (1.2s)
    setTimeout(() => {
      setAiChoice(randomChoice);
      setShaking(false);

      // Determine outcome
      let outcome = "";
      if (choice === randomChoice) {
        outcome = "draw";
        setDraws((prev) => prev + 1);
      } else if (
        (choice === "rock" && randomChoice === "scissors") ||
        (choice === "paper" && randomChoice === "rock") ||
        (choice === "scissors" && randomChoice === "paper")
      ) {
        outcome = "win";
        setPlayerScore((prev) => prev + 1);
      } else {
        outcome = "loss";
        setAiScore((prev) => prev + 1);
      }

      setRoundResult(outcome);

      const newRound = {
        roundNum: round,
        playerChoice: choice,
        aiChoice: randomChoice,
        result: outcome,
      };
      setRoundHistory((prev) => [...prev, newRound]);
    }, 1200);
  };

  // Move to next round or end game
  const handleNextRound = () => {
    if (round >= 3) {
      handleMatchEnd();
    } else {
      setRound((prev) => prev + 1);
      setPlayerChoice(null);
      setAiChoice(null);
      setRoundResult(null);
    }
  };

  // Submit match score to backend
  const handleMatchEnd = async () => {
    setGameState("gameover");

    const wonMatch = playerScore > aiScore;
    const isDraw = playerScore === aiScore;
    const points = wonMatch ? 100 : isDraw ? 50 : 30;
    setPointsGained(points);
    setSubmittingScore(true);
    setScoreStatus("Retrieving existing points...");

    try {
      // Find current score from existing leaderboard
      const existingUser = leaderboard.find(
        (item) => item.value.toLowerCase() === username.trim().toLowerCase()
      );
      const currentScore = existingUser ? existingUser.score : 0;
      const finalAccumulatedScore = currentScore + points;
      setFinalScore(finalAccumulatedScore);

      setScoreStatus(`Saving score (${finalAccumulatedScore} pts)...`);
      const res = await fetch(`${BACKEND_URL}/api/othergame/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          score: finalAccumulatedScore,
        }),
      });

      if (!res.ok) throw new Error("Failed to write score to DB");

      setScoreStatus("Score submitted successfully!");
      // Reload leaderboard to show updated score
      await fetchLeaderboard();
    } catch (err) {
      console.error(err);
      setScoreStatus("Error submitting score, backend may be offline.");
    } finally {
      setSubmittingScore(false);
    }
  };

  const handleStartMatchmaking = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setGameState("matchmaking");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-6xl w-full mx-auto">
      {/* Header */}
      <header className="text-center mb-8 w-full animate-float">
        <h1 className="text-4xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          RPS ARENA
        </h1>
        <p className="text-gray-400 text-xs md:text-sm tracking-widest uppercase mt-2">
          Climb the Global Leaderboard
        </p>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 flex flex-col justify-center">
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button
              onClick={fetchLeaderboard}
              className="px-3 py-1 bg-rose-500 hover:bg-rose-600 transition text-white font-semibold rounded text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dynamic component routing based on state */}
        {gameState === "lobby" && (
          <HomeView
            username={username}
            setUsername={setUsername}
            leaderboard={leaderboard}
            loadingLeaderboard={loadingLeaderboard}
            fetchLeaderboard={fetchLeaderboard}
            onStartMatchmaking={handleStartMatchmaking}
          />
        )}

        {(gameState === "matchmaking" || gameState === "arena") && (
          <MatchView
            username={username}
            gameState={gameState}
            matchmakingProgress={matchmakingProgress}
            round={round}
            playerScore={playerScore}
            aiScore={aiScore}
            playerChoice={playerChoice}
            aiChoice={aiChoice}
            roundResult={roundResult}
            shaking={shaking}
            roundHistory={roundHistory}
            onPlayRound={handlePlayRound}
            onNextRound={handleNextRound}
          />
        )}

        {gameState === "gameover" && (
          <ResultView
            playerScore={playerScore}
            aiScore={aiScore}
            pointsGained={pointsGained}
            finalScore={finalScore}
            submittingScore={submittingScore}
            scoreStatus={scoreStatus}
            onReplay={() => setGameState("lobby")}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-gray-600 tracking-wider">
        RPS ARENA © 2026 • INTEGRATED WEB APPLICATION LEADERBOARD
      </footer>
    </div>
  );
}
