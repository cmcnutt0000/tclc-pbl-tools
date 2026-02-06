'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateBoardButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch('/api/boards', { method: 'POST' });
      const board = await res.json();
      router.push(`/board/${board.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? 'Creating...' : '+ New Board'}
    </button>
  );
}
