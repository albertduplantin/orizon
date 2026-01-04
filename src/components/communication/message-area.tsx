"use client";

import { useEffect, useState, useRef } from "react";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: string;
}

interface Message {
  id: string;
  content: string;
  userId: string;
  createdAt: Date;
  type?: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface MessageAreaProps {
  channel: Channel;
  userId: string;
  tenantId: string;
}

export function MessageArea({ channel, userId, tenantId }: MessageAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger les messages initiaux
  useEffect(() => {
    async function loadMessages() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/communication/messages/${channel.id}`);
        if (!res.ok) throw new Error('Erreur chargement messages');

        const data = await res.json();
        setMessages(data.messages.reverse()); // Inverser pour chronologique

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView();
        }, 100);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, [channel.id]);

  const handleSendMessage = async (content: string) => {
    try {
      const res = await fetch('/api/communication/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: channel.id,
          content,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur envoi message');
      }

      const { message } = await res.json();

      // Ajouter le message optimistiquement
      setMessages(prev => [...prev, message]);

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="h-14 border-b px-4 flex items-center">
        <h2 className="font-semibold"># {channel.name}</h2>
        {channel.description && (
          <span className="ml-4 text-sm text-muted-foreground">
            {channel.description}
          </span>
        )}
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={userId}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
      />

      {/* Input */}
      <MessageInput
        onSend={handleSendMessage}
        placeholder={`Message dans #${channel.name}`}
      />
    </div>
  );
}
