"use client";

import { useState } from "react";

const STARTING_SCORES = [301, 501, 701] as const;
type StartScore = (typeof STARTING_SCORES)[number];

interface HistoryEntry {
  thrown: number;
  bust: boolean;
}

interface Player {
  name: string;
  score: number;
  history: HistoryEntry[];
}

export default function DartsScorePage() {
  const [startScore, setStartScore] = useState<StartScore>(501);
  const [players, setPlayers] = useState<Player[]>([
    { name: "Player 1", score: 501, history: [] },
    { name: "Player 2", score: 501, history: [] },
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [winner, setWinner] = useState<number | null>(null);
  const [inputVal, setInputVal] = useState("");

  function throwScore(thrown: number) {
    if (winner !== null) return;
    const p = players[currentPlayer];
    const newScore = p.score - thrown;

    setPlayers((prev) => {
      const next = prev.map((pl) => ({ ...pl, history: [...pl.history] }));
      if (newScore < 0 || newScore === 1) {
        next[currentPlayer].history.push({ thrown, bust: true });
      } else {
        next[currentPlayer].score = newScore;
        next[currentPlayer].history.push({ thrown, bust: false });
      }
      return next;
    });

    if (newScore === 0) {
      setWinner(currentPlayer);
    } else if (newScore >= 0 && newScore !== 1) {
      setCurrentPlayer((prev) => (prev + 1) % players.length);
    }

    setInputVal("");
  }

  function handleSubmit() {
    const val = parseInt(inputVal, 10);
    if (isNaN(val) || val < 0 || val > 180) return;
    throwScore(val);
  }

  function undoLast() {
    const prev = (currentPlayer - 1 + players.length) % players.length;
    const p = players[prev];
    if (!p.history.length) return;
    const last = p.history[p.history.length - 1];

    setPlayers((pls) => {
      const next = pls.map((pl) => ({ ...pl, history: [...pl.history] }));
      next[prev].history.pop();
      if (!last.bust) next[prev].score += last.thrown;
      return next;
    });

    setCurrentPlayer(prev);
    setWinner(null);
    setInputVal("");
  }

  function addPlayer() {
    if (players.length >= 6) return;
    setPlayers((prev) => [
      ...prev,
      { name: `Player ${prev.length + 1}`, score: startScore, history: [] },
    ]);
  }

  function removePlayer(i: number) {
    if (players.length <= 2) return;
    setPlayers((prev) => prev.filter((_, idx) => idx !== i));
    setCurrentPlayer((prev) => (prev >= players.length - 1 ? 0 : prev));
  }

  function renamePlayer(i: number, name: string) {
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, name } : p)),
    );
  }

  function newGame(score?: StartScore) {
    const s = score ?? startScore;
    setPlayers((prev) =>
      prev.map((p) => ({ name: p.name, score: s, history: [] })),
    );
    setCurrentPlayer(0);
    setWinner(null);
    setInputVal("");
  }

  function changeStartScore(val: StartScore) {
    setStartScore(val);
    newGame(val);
  }

  const QUICK_SCORES = [20, 26, 41, 45, 60, 81, 100, 140, 180];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium text-gray-900">Darts</h1>
          <button
            onClick={() => newGame()}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            New game
          </button>
        </div>

        {/* Settings row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-sm text-gray-500">Starting score:</span>
          <select
            value={startScore}
            onChange={(e) =>
              changeStartScore(Number(e.target.value) as StartScore)
            }
            disabled={winner !== null}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-800 disabled:opacity-50"
          >
            {STARTING_SCORES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {players.length < 6 && (
            <button
              onClick={addPlayer}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              + Add player
            </button>
          )}
        </div>

        {/* Winner banner */}
        {winner !== null && (
          <div className="bg-green-50 border border-green-300 rounded-xl p-5 text-center mb-6">
            <p className="text-xl font-medium text-green-800">
              {players[winner].name} wins!
            </p>
            <p className="text-sm text-green-600 mt-1">
              Checked out from {startScore}
            </p>
            <button
              onClick={() => newGame()}
              className="mt-3 text-sm border border-green-400 rounded-lg px-4 py-1.5 text-green-700 hover:bg-green-100 transition-colors"
            >
              Play again
            </button>
          </div>
        )}

        {/* Player cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {players.map((p, i) => {
            const isCurrent = i === currentPlayer && winner === null;
            const recent = [...p.history].reverse().slice(0, 5);

            return (
              <div
                key={i}
                className={`bg-white rounded-xl p-4 relative transition-all ${
                  isCurrent
                    ? "border-2 border-blue-500"
                    : "border border-gray-200"
                }`}
              >
                {players.length > 2 && (
                  <button
                    onClick={() => removePlayer(i)}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                )}

                <div className="flex items-center gap-2 mb-3">
                  {isCurrent && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                  {!isCurrent && <div className="w-2 h-2 shrink-0" />}
                  <input
                    value={p.name}
                    onChange={(e) => renamePlayer(i, e.target.value)}
                    className="font-medium text-gray-900 bg-transparent border-none outline-none flex-1 min-w-0 focus:border-b focus:border-gray-400"
                  />
                </div>

                <div className="text-5xl font-medium text-gray-900 leading-none mb-1">
                  {p.score}
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  {p.score === 0 ? "checked out!" : `${p.score} remaining`}
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-6">
                  {recent.map((h, j) => (
                    <span
                      key={j}
                      className={`text-xs rounded-md px-2 py-0.5 ${
                        h.bust
                          ? "bg-red-50 text-red-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {h.bust ? "BUST" : `-${h.thrown}`}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Score input */}
        {winner === null && (
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-3">
              Score for{" "}
              <span className="font-medium text-gray-800">
                {players[currentPlayer].name}
              </span>
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="number"
                min={0}
                max={180}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="0"
                className="flex-1 text-2xl font-medium border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 outline-none focus:border-blue-400"
                autoFocus
              />
              <button
                onClick={handleSubmit}
                className="bg-gray-900 text-white rounded-lg px-5 py-2 font-medium hover:bg-gray-700 transition-colors"
              >
                Throw
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {QUICK_SCORES.map((n) => (
                <button
                  key={n}
                  onClick={() => throwScore(n)}
                  className="text-xs border border-gray-300 bg-white rounded-md px-2.5 py-1 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {n}
                </button>
              ))}
              <span className="text-gray-300 text-sm self-center">|</span>
              <button
                onClick={undoLast}
                className="text-xs border border-red-200 bg-white rounded-md px-2.5 py-1 text-red-500 hover:bg-red-50 transition-colors"
              >
                Undo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
