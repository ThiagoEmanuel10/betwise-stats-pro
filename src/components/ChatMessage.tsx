
import { FC } from "react";

interface ChatMessageProps {
  content: string;
  isCurrentUser: boolean;
  timestamp: string;
}

export const ChatMessage: FC<ChatMessageProps> = ({ content, isCurrentUser, timestamp }) => {
  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`rounded-lg px-4 py-2 max-w-[70%] ${
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary"
        }`}
      >
        <p className="break-words">{content}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
