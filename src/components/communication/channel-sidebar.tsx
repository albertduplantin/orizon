"use client";

import { Hash, Lock, Volume2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  name: string;
  type: string;
  description: string | null;
  unreadCount?: number;
}

interface ChannelSidebarProps {
  channels: Channel[];
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
}

export function ChannelSidebar({
  channels,
  activeChannelId,
  onChannelSelect,
}: ChannelSidebarProps) {
  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'broadcast':
        return <Volume2 className="w-4 h-4" />;
      case 'direct':
        return <Users className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const publicChannels = channels.filter(c => c.type === 'public');
  const privateChannels = channels.filter(c => c.type === 'private');
  const broadcastChannels = channels.filter(c => c.type === 'broadcast');

  const renderChannelGroup = (title: string, channelList: Channel[]) => {
    if (channelList.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase">
          {title}
        </h3>
        <div className="space-y-1">
          {channelList.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                activeChannelId === channel.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-foreground"
              )}
            >
              {getChannelIcon(channel.type)}
              <span className="flex-1 text-left truncate">{channel.name}</span>
              {channel.unreadCount && channel.unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
      <h2 className="font-bold text-lg mb-4">Channels</h2>

      {renderChannelGroup("Annonces", broadcastChannels)}
      {renderChannelGroup("Publics", publicChannels)}
      {renderChannelGroup("Privés", privateChannels)}

      {channels.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Aucun channel disponible
        </p>
      )}
    </div>
  );
}
