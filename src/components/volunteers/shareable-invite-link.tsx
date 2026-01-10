"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2, Mail } from "lucide-react";

interface ShareableInviteLinkProps {
  code: string;
  email?: string;
}

export function ShareableInviteLink({ code, email }: ShareableInviteLinkProps) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : "https://orizon-azure.vercel.app"}/join/${code}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Lien copié", {
        description: "Le lien d'invitation a été copié dans le presse-papier",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erreur", {
        description: "Impossible de copier le lien",
      });
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Invitation - Rejoignez-nous comme bénévole");
    const body = encodeURIComponent(
      `Bonjour,\n\nVous êtes invité(e) à rejoindre notre équipe de bénévoles !\n\nCliquez sur ce lien pour vous inscrire :\n${inviteUrl}\n\nÀ bientôt !`
    );
    const mailtoLink = email
      ? `mailto:${email}?subject=${subject}&body=${body}`
      : `mailto:?subject=${subject}&body=${body}`;

    window.location.href = mailtoLink;
  };

  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Invitation bénévole",
          text: "Rejoignez-nous comme bénévole !",
          url: inviteUrl,
        });
        toast.success("Lien partagé");
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== "AbortError") {
          toast.error("Erreur lors du partage");
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inviteUrl}
          readOnly
          className="font-mono text-sm"
          onClick={(e) => e.currentTarget.select()}
        />
        <Button
          size="icon"
          variant="outline"
          onClick={copyToClipboard}
          className="shrink-0"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={shareViaEmail}
          className="flex-1"
        >
          <Mail className="w-4 h-4 mr-2" />
          Partager par email
        </Button>
        {navigator.share && (
          <Button
            size="sm"
            variant="outline"
            onClick={shareViaNative}
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        )}
      </div>
    </div>
  );
}
