"use client";

import { useState, useEffect } from "react";

interface BoardVariationPanelProps {
  loading: boolean;
  onDismiss: () => void;
}

const LOADING_MESSAGES = [
  "Cooking up a sick idea...",
  "Brainstorming like a room full of 5th graders...",
  "Connecting the dots across subjects...",
  "Thinking outside the textbook...",
  "Channeling our inner design thinker...",
  "Making learning come alive...",
  "Building something students will actually care about...",
  "Finding the real-world connection...",
  "Crafting questions worth investigating...",
  "Turning standards into adventures...",
  "Designing for curiosity...",
  "Mixing creativity with rigor...",
  "Almost there, this is a big one...",
];

function LoadingSpinner() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-16 px-6">
      <div className="inline-block w-10 h-10 border-3 border-brand-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-lg font-medium text-stone-700 mt-4">
        {LOADING_MESSAGES[msgIndex]}
      </p>
      <p className="text-sm text-stone-400 mt-2">
        This can take a few minutes — we're building a complete project design.
      </p>
    </div>
  );
}

export default function BoardVariationPanel({
  loading,
  onDismiss,
}: BoardVariationPanelProps) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="border-b border-stone-200 px-5 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-stone-800 text-lg">
            Generating Your Board
          </h3>
          <button
            onClick={onDismiss}
            className="text-stone-400 hover:text-stone-600 text-lg"
          >
            &#x2715;
          </button>
        </div>
        <LoadingSpinner />
      </div>
    </div>
  );
}
