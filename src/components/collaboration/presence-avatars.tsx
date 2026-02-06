"use client";
interface User { name: string; color: string; }
interface PresenceAvatarsProps { users: User[]; }
export default function PresenceAvatars({ users }: PresenceAvatarsProps) {
  if (users.length === 0) return null;
  return (
    <div className="flex -space-x-2">
      {users.map((user, i) => (
        <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white" style={{ backgroundColor: user.color }} title={user.name}>
          {user.name.charAt(0).toUpperCase()}
        </div>
      ))}
    </div>
  );
}