"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  placeholder?: string;
}

export function MessageInput({ onSend, placeholder }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSend(content.trim());
      setContent("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200/50 p-4 bg-white/60 backdrop-blur-sm">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Écrivez votre message..."}
          className="resize-none bg-white/80 border-gray-200/50 focus:border-primary/50"
          rows={3}
          disabled={isSending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || isSending}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Appuyez sur Entrée pour envoyer, Shift+Entrée pour un saut de ligne
      </p>
    </form>
  );
}
