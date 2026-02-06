"use client";
import { ReactNode } from "react";
interface CollaborationProviderProps { roomId: string; children: ReactNode; }
export default function CollaborationProvider({ roomId, children }: CollaborationProviderProps) {
  return <>{children}</>;
}