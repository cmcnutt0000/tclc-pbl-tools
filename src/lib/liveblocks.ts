import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

export type Presence = {
  displayName: string;
  avatarColor: string;
  activeCellId: string | null;
};

export type Storage = {
  boardContentJson: string;
};

export const { RoomProvider, useStorage, useMutation, useSelf, useOthers } =
  createRoomContext<Presence, Storage>(client);