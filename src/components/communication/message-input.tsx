"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  onTyping?: () => void;
  placeholder?: string;
}

export function MessageInput({ onSend, onTyping, placeholder }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Déclencher l'indicateur de frappe
    if (onTyping && e.target.value.trim()) {
      onTyping();
    }
  };

  const handleAIEnhance = async (action: "improve" | "translate" | "shorten") => {
    if (!content.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const prompts = {
        improve: "Améliore ce message pour qu'il soit plus clair et professionnel, en conservant le sens original:",
        translate: "Traduis ce message en anglais de manière naturelle:",
        shorten: "Raccourcis ce message tout en gardant les informations essentielles:",
      };

      const res = await fetch("/api/communication/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          prompt: prompts[action],
        }),
      });

      if (!res.ok) throw new Error("Erreur AI");

      const { enhanced } = await res.json();
      setContent(enhanced);
    } catch (error) {
      console.error("Erreur AI:", error);
      alert("Erreur lors de l'amélioration du message");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200/50 p-4 bg-white/60 backdrop-blur-sm">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Écrivez votre message..."}
          className="resize-none bg-white/80 border-gray-200/50 focus:border-primary/50"
          rows={3}
          disabled={isSending || isGenerating}
        />
        <div className="flex flex-col gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={!content.trim() || isGenerating || isSending}
                title="Améliorer avec l'IA"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAIEnhance("improve")}>
                <Sparkles className="w-4 h-4 mr-2" />
                Améliorer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAIEnhance("shorten")}>
                <Sparkles className="w-4 h-4 mr-2" />
                Raccourcir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAIEnhance("translate")}>
                <Sparkles className="w-4 h-4 mr-2" />
                Traduire en anglais
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="submit"
            size="icon"
            disabled={!content.trim() || isSending || isGenerating}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center mt-1">
        <p className="text-xs text-muted-foreground">
          {isGenerating ? "Amélioration en cours..." : "Entrée pour envoyer, Shift+Entrée pour saut de ligne"}
        </p>
        {content.trim() && (
          <p className="text-xs text-muted-foreground">
            {content.length} caractères
          </p>
        )}
      </div>
    </form>
  );
}
