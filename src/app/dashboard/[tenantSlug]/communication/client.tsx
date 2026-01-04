"use client";

import { useState } from "react";
import { ChannelSidebar } from "@/components/communication/channel-sidebar";
import { MessageArea } from "@/components/communication/message-area";

interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  moduleId: string | null;
  isArchived: boolean;
  createdAt: Date;
}

interface CommunicationClientProps {
  channels: Channel[];
  userId: string;
  tenantId: string;
}

export function CommunicationClient({
  channels,
  userId,
  tenantId,
}: CommunicationClientProps) {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(
    channels.length > 0 ? channels[0].id : null
  );

  const activeChannel = channels.find(c => c.id === activeChannelId);

  return (
    <div className="h-full flex bg-white/50">
      <ChannelSidebar
        channels={channels}
        activeChannelId={activeChannelId}
        onChannelSelect={setActiveChannelId}
      />

      {activeChannel ? (
        <MessageArea
          channel={activeChannel}
          userId={userId}
          tenantId={tenantId}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white/30">
          <p className="text-muted-foreground">
            Sélectionnez un channel pour commencer
          </p>
        </div>
      )}
    </div>
  );
}
