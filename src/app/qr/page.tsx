"use client";

import { useQRCode } from "next-qrcode";
import { useState, useRef } from "react";

export default function QrPage() {
  const { Canvas } = useQRCode();
  const [inputValue, setInputValue] = useState("https://nextjs.org");
  const [qrText, setQrText] = useState("https://nextjs.org");
  const [darkColor, setDarkColor] = useState("#0f172a");
  const [lightColor, setLightColor] = useState("#f8fafc");
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    if (!inputValue.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setQrText(inputValue);
      setIsGenerating(false);
    }, 400);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleGenerate();
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 font-mono">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full bg-violet-700/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-75 h-75 rounded-full bg-cyan-500/8 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            QR Generator
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Generate QR Code
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Paste any URL or text and generate instantly
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-6 shadow-2xl">
          {/* Input */}
          <div className="mb-5">
            <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">
              URL or Text
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>

          {/* Color pickers + error level */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">
                Dark
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 hover:border-white/20 transition-all">
                <span
                  className="w-5 h-5 rounded-md border border-white/20 shrink-0"
                  style={{ background: darkColor }}
                />
                <span className="text-xs text-slate-400 truncate">
                  {darkColor}
                </span>
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">
                Light
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 hover:border-white/20 transition-all">
                <span
                  className="w-5 h-5 rounded-md border border-white/20 shrink-0"
                  style={{ background: lightColor }}
                />
                <span className="text-xs text-slate-400 truncate">
                  {lightColor}
                </span>
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">
                Error Lvl
              </label>
              <select
                value={errorLevel}
                onChange={(e) =>
                  setErrorLevel(e.target.value as "L" | "M" | "Q" | "H")
                }
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-violet-500/60 transition-all appearance-none cursor-pointer"
              >
                {["L", "M", "Q", "H"].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!inputValue.trim() || isGenerating}
            className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200
              bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg shadow-violet-900/40"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Generating…
              </span>
            ) : (
              "Generate QR Code"
            )}
          </button>

          {/* QR Preview */}
          {qrText && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <div
                ref={canvasRef}
                className={`rounded-2xl overflow-hidden border border-white/10 shadow-xl transition-all duration-500 ${
                  isGenerating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
              >
                <Canvas
                  text={qrText}
                  options={{
                    errorCorrectionLevel: errorLevel,
                    margin: 3,
                    scale: 4,
                    width: 240,
                    color: {
                      dark: darkColor,
                      light: lightColor,
                    },
                  }}
                />
              </div>

              <p className="text-xs text-slate-600 max-w-60 truncate text-center">
                {qrText}
              </p>

              {/* Download button */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                  border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white
                  active:scale-[0.97] transition-all duration-150"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                  />
                </svg>
                Download PNG
              </button>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <p className="mt-5 text-center text-xs text-slate-700">
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-500">
            ↵ Enter
          </kbd>{" "}
          to generate quickly
        </p>
      </div>
    </main>
  );
}
