"use client";

import { useEffect } from 'react';
import { createClient } from './client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  type?: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface UseRealtimeMessagesOptions {
  channelId: string;
  onNewMessage: (message: Message) => void;
}

export function useRealtimeMessages({
  channelId,
  onNewMessage,
}: UseRealtimeMessagesOptions) {
  useEffect(() => {
    const supabase = createClient();

    // Subscribe to INSERT events on the messages table for this channel
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on<Message>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channelId=eq.${channelId}`,
        },
        async (payload: RealtimePostgresChangesPayload<Message>) => {
          // Le payload contient le nouveau message mais sans les relations
          // On doit refetch le message avec les infos utilisateur
          const newMessage = payload.new as Message;

          // Appeler l'API pour obtenir les infos utilisateur complètes
          try {
            const res = await fetch(`/api/communication/messages/${channelId}/single?messageId=${newMessage.id}`);
            if (res.ok) {
              const { message } = await res.json();
              onNewMessage(message);
            } else {
              // Fallback: utiliser le message sans user info
              onNewMessage(newMessage);
            }
          } catch (error) {
            console.error('Erreur récupération message:', error);
            onNewMessage(newMessage);
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, onNewMessage]);
}
