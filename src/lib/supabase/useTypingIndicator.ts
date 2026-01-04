"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

interface UseTypingIndicatorOptions {
  channelId: string;
  currentUserId: string;
  currentUserName: string;
}

interface UseTypingIndicatorReturn {
  typingUsers: TypingUser[];
  startTyping: () => void;
  stopTyping: () => void;
}

const TYPING_TIMEOUT = 3000; // 3 secondes sans activité = arrêt de frappe

export function useTypingIndicator({
  channelId,
  currentUserId,
  currentUserName,
}: UseTypingIndicatorOptions): UseTypingIndicatorReturn {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Créer un channel broadcast pour les indicateurs de frappe
    const channel = supabase.channel(`typing:${channelId}`, {
      config: {
        broadcast: { self: false }, // Ne pas recevoir ses propres événements
      },
    });

    // Écouter les événements de frappe
    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, userName, isTyping } = payload.payload as {
          userId: string;
          userName: string;
          isTyping: boolean;
        };

        if (isTyping) {
          setTypingUsers(prev => {
            // Ajouter ou mettre à jour l'utilisateur en train de taper
            const filtered = prev.filter(u => u.userId !== userId);
            return [...filtered, { userId, userName, timestamp: Date.now() }];
          });
        } else {
          setTypingUsers(prev => prev.filter(u => u.userId !== userId));
        }
      })
      .subscribe();

    channelRef.current = channel;

    // Nettoyer les utilisateurs inactifs toutes les secondes
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev =>
        prev.filter(u => now - u.timestamp < TYPING_TIMEOUT)
      );
    }, 1000);

    return () => {
      clearInterval(cleanupInterval);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const startTyping = useCallback(() => {
    if (!channelRef.current) return;

    // Envoyer l'événement de début de frappe
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: currentUserId,
        userName: currentUserName,
        isTyping: true,
      },
    });

    // Réinitialiser le timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Arrêter automatiquement après le timeout
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, TYPING_TIMEOUT);
  }, [currentUserId, currentUserName]);

  const stopTyping = useCallback(() => {
    if (!channelRef.current) return;

    // Envoyer l'événement d'arrêt de frappe
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: currentUserId,
        userName: currentUserName,
        isTyping: false,
      },
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [currentUserId, currentUserName]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
}
