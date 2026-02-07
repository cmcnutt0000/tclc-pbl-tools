export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { auth0 } from "@/lib/auth0";
import Link from "next/link";
import CreateBoardButton from "./create-board-button";
import type { BoardContent } from "@/types/board";

export default async function Dashboard() {
  const session = await auth0.getSession();
  const user = session?.user;

  const boards = await prisma.board.findMany({
    where: user?.sub ? { userId: user.sub } : { userId: null },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-brand-800 text-white shadow-md">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/justlighthouse.svg"
              alt=""
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-2xl font-bold">TCLC PBL Tools</h1>
              <p className="text-brand-200 text-sm">
                Third Coast Learning Collaborative
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-brand-200">
                  {user.name || user.email}
                </span>
                <a
                  href="/auth/logout"
                  className="text-sm text-brand-300 hover:text-white transition-colors"
                >
                  Sign Out
                </a>
              </div>
            )}
            <CreateBoardButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="text-xl font-semibold text-stone-800 mb-6">
          Your Design Boards
        </h2>

        {boards.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
            <p className="text-stone-500 text-lg mb-4">
              No boards yet. Create your first PBL Design Board!
            </p>
            <CreateBoardButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => {
              let content: BoardContent | null = null;
              try {
                content = JSON.parse(board.content) as BoardContent;
              } catch {}
              const mainTopic = content?.initialPlanning?.mainIdea?.value;
              const drivingQuestion =
                content?.designThinking?.drivingQuestion?.value;
              const displayTitle = mainTopic || board.title;

              return (
                <Link
                  key={board.id}
                  href={`/board/${board.id}`}
                  className="block bg-white rounded-xl border border-stone-200 p-5 hover:shadow-lg hover:border-brand-300 transition-all"
                >
                  <h3 className="font-semibold text-stone-800 text-lg mb-1">
                    {displayTitle}
                  </h3>
                  {drivingQuestion && (
                    <p className="text-sm text-stone-500 italic mb-2 line-clamp-2">
                      {drivingQuestion}
                    </p>
                  )}
                  <div className="flex gap-2 flex-wrap mb-3">
                    {board.gradeLevel && (
                      <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                        {board.gradeLevel}
                      </span>
                    )}
                    {board.state && (
                      <span className="text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full">
                        {board.state}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400">
                    Updated {new Date(board.updatedAt).toLocaleDateString()}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
