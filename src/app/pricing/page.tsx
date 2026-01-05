import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const PRICING_PLANS = [
  {
    id: "free",
    name: "FREE",
    price: 0,
    period: "forever",
    description: "Pour les petites associations et événements ponctuels",
    features: [
      "2 événements actifs simultanés",
      "50 participants/bénévoles par événement",
      "Module Communication (messages illimités)",
      "Module Volunteers (basique)",
      "1 résumé IA par mois",
      "Support communautaire",
    ],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    id: "pro",
    name: "PRO",
    price: 29,
    period: "mois",
    description: "Pour les festivals récurrents et associations structurées",
    popular: true,
    features: [
      "Événements illimités",
      "Participants/bénévoles illimités",
      "Tous modules (Project, Sponsors...)",
      "20 résumés IA/mois",
      "Intégrations Discord/Telegram",
      "Exports avancés (PDF, CSV)",
      "White-label partiel (logo custom)",
      "Support email prioritaire (<24h)",
    ],
    cta: "Démarrer essai gratuit",
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    price: 200,
    period: "mois",
    description: "Pour les gros festivals et réseaux d'associations",
    subtitle: "à partir de",
    features: [
      "Tout PRO +",
      "Résumés IA illimités",
      "SSO (connexion unique entreprise)",
      "API dédiée + webhooks customs",
      "White-label complet (domaine custom)",
      "Formation équipe incluse",
      "Support dédié (chat direct, calls)",
      "SLA 99.9% uptime",
    ],
    cta: "Contacter équipe",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ORIZON
          </Link>
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Commencer</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Hero section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Tarification simple et transparente
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Choisissez le plan qui correspond à vos besoins
          </p>
          <p className="text-muted-foreground">
            Tous les plans incluent 14 jours d&apos;essai gratuit • Sans engagement • Annulation à tout moment
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card p-8 rounded-2xl relative ${
                plan.popular ? "ring-2 ring-primary shadow-xl scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                    POPULAIRE
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <div className="mb-3">
                  {plan.subtitle && (
                    <span className="text-sm text-muted-foreground">
                      {plan.subtitle}{" "}
                    </span>
                  )}
                  <span className="text-5xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/sign-up" className="block">
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="glass-card p-12 rounded-2xl max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Questions fréquentes
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-muted-foreground">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Que se passe-t-il après l&apos;essai gratuit ?
              </h3>
              <p className="text-muted-foreground">
                Après 14 jours, vous passez automatiquement au plan gratuit si vous n&apos;avez pas choisi de plan payant. Aucune carte bancaire requise pour l&apos;essai.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Proposez-vous des réductions pour les associations ?
              </h3>
              <p className="text-muted-foreground">
                Oui ! Nous offrons jusqu&apos;à 50% de réduction pour les associations à but non lucratif. Contactez-nous pour en savoir plus.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Comment fonctionne le support ?
              </h3>
              <p className="text-muted-foreground">
                Le plan FREE bénéficie du support communautaire, le plan PRO d&apos;un support email sous 24h, et le plan ENTERPRISE d&apos;un support dédié avec chat et appels.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à organiser votre prochain événement ?
          </h2>
          <p className="text-muted-foreground mb-6">
            Rejoignez des centaines d&apos;organisateurs qui utilisent ORIZON
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-8">
              Commencer gratuitement
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t mt-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2026 ORIZON. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary">
                Tarifs
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
