export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db';
import Link from 'next/link';
import CreateBoardButton from './create-board-button';

export default async function Dashboard() {
  const boards = await prisma.board.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-teal-600 text-white shadow-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">TCLC PBL Tools</h1>
            <p className="text-teal-100 text-sm">Third Coast Learning Collaborative</p>
          </div>
          <CreateBoardButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="text-xl font-semibold text-stone-800 mb-6">Your Design Boards</h2>

        {boards.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
            <p className="text-stone-500 text-lg mb-4">No boards yet. Create your first PBL Design Board!</p>
            <CreateBoardButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/board/${board.id}`}
                className="block bg-white rounded-xl border border-stone-200 p-5 hover:shadow-lg hover:border-teal-300 transition-all"
              >
                <h3 className="font-semibold text-stone-800 text-lg mb-1">{board.title}</h3>
                <div className="flex gap-2 flex-wrap mb-3">
                  {board.gradeLevel && (
                    <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{board.gradeLevel}</span>
                  )}
                  {board.state && (
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{board.state}</span>
                  )}
                </div>
                <p className="text-xs text-stone-400">
                  Updated {new Date(board.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
