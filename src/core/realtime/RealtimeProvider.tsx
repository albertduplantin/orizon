"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeContextType = {
  subscribe: (channelName: string, config: ChannelConfig) => RealtimeChannel | null;
  unsubscribe: (channelName: string) => void;
  isConnected: boolean;
};

type ChannelConfig = {
  event: string;
  schema?: string;
  table?: string;
  filter?: string;
  callback: (payload: any) => void;
};

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [channels, setChannels] = useState<Map<string, RealtimeChannel>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Monitor connection status
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      setIsConnected(true);
    });

    return () => {
      authListener.subscription.unsubscribe();
      // Cleanup all channels on unmount
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [supabase, channels]);

  const subscribe = (channelName: string, config: ChannelConfig): RealtimeChannel | null => {
    try {
      // Check if channel already exists
      if (channels.has(channelName)) {
        console.warn(`Channel ${channelName} already subscribed`);
        return channels.get(channelName)!;
      }

      const channel = supabase.channel(channelName);

      // Configure based on config type
      if (config.schema && config.table) {
        // Database changes subscription
        channel.on(
          'postgres_changes',
          {
            event: config.event as any,
            schema: config.schema,
            table: config.table,
            filter: config.filter,
          },
          config.callback
        );
      } else {
        // Broadcast subscription (for custom events)
        channel.on('broadcast', { event: config.event }, config.callback);
      }

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✓ Subscribed to ${channelName}`);
          setIsConnected(true);
        }
        if (status === 'CLOSED') {
          console.log(`✗ Channel ${channelName} closed`);
          setIsConnected(false);
        }
      });

      setChannels((prev) => new Map(prev).set(channelName, channel));
      return channel;
    } catch (error) {
      console.error(`Error subscribing to ${channelName}:`, error);
      return null;
    }
  };

  const unsubscribe = (channelName: string) => {
    const channel = channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      setChannels((prev) => {
        const newMap = new Map(prev);
        newMap.delete(channelName);
        return newMap;
      });
      console.log(`Unsubscribed from ${channelName}`);
    }
  };

  return (
    <RealtimeContext.Provider value={{ subscribe, unsubscribe, isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
