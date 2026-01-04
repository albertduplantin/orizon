"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Message {
  id: string;
  content: string;
  userId: string;
  createdAt: Date;
  type?: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({
  messages,
  currentUserId,
  isLoading,
  messagesEndRef,
}: MessageListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Chargement des messages...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isSystem = message.type === 'system';
        const isOwn = message.userId === currentUserId;

        if (isSystem) {
          return (
            <div key={message.id} className="text-center">
              <p className="text-sm text-muted-foreground italic">
                {message.content}
              </p>
            </div>
          );
        }

        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {message.user?.image ? (
                <img
                  src={message.user.image}
                  alt={message.user.name || ''}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-sm font-semibold">
                  {(message.user?.name || 'U')[0].toUpperCase()}
                </span>
              )}
            </div>

            {/* Message */}
            <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {message.user?.name || 'Utilisateur'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.createdAt), 'HH:mm', { locale: fr })}
                </span>
              </div>
              <div
                className={`
                  inline-block px-3 py-2 rounded-lg
                  ${isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                  }
                `}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
