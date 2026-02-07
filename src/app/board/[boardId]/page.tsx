export const dynamic = "force-dynamic";
import { auth0 } from "@/lib/auth0";
import { notFound } from "next/navigation";
import { loadBoard } from "@/lib/load-board";
import BoardPageClient from "./board-page-client";

interface Props {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: Props) {
  const { boardId } = await params;
  const session = await auth0.getSession();
  const result = await loadBoard(boardId);
  if (!result) notFound();

  const { board, content, context } = result;

  // Verify board belongs to the logged-in user (or is unowned)
  if (board.userId && session?.user?.sub && board.userId !== session.user.sub) {
    notFound();
  }

  return (
    <BoardPageClient
      boardId={board.id}
      initialTitle={board.title}
      initialContent={content}
      initialContext={context}
    />
  );
}
