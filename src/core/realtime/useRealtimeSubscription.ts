"use client";

import { useEffect, useRef } from 'react';
import { useRealtime } from './RealtimeProvider';

type SubscriptionConfig = {
  channelName: string;
  event: string;
  schema?: string;
  table?: string;
  filter?: string;
  callback: (payload: any) => void;
  enabled?: boolean;
};

export function useRealtimeSubscription(config: SubscriptionConfig) {
  const { subscribe, unsubscribe } = useRealtime();
  const channelRef = useRef<string | null>(null);

  useEffect(() => {
    if (config.enabled === false) return;

    channelRef.current = config.channelName;

    subscribe(config.channelName, {
      event: config.event,
      schema: config.schema,
      table: config.table,
      filter: config.filter,
      callback: config.callback,
    });

    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current);
      }
    };
  }, [
    config.channelName,
    config.event,
    config.schema,
    config.table,
    config.filter,
    config.enabled,
    subscribe,
    unsubscribe,
  ]);
}
