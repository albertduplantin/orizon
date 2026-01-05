import { requireSuperAdmin } from "@/lib/admin/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Pencil } from "lucide-react";

// Configuration tarifaire (sera éventuellement en BDD)
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
    limits: {
      tenants: 2,
      members: 50,
      aiSummaries: 1,
    },
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
    limits: {
      tenants: -1, // illimité
      members: -1,
      aiSummaries: 20,
    },
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
    limits: {
      tenants: -1,
      members: -1,
      aiSummaries: -1,
    },
  },
];

export default async function PricingManagementPage() {
  await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Politique Tarifaire</h1>
          <p className="text-muted-foreground">
            Gestion des plans et de la facturation
          </p>
        </div>

        {/* Plans tarifaires */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card p-6 rounded-2xl ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="text-center mb-4">
                  <span className="px-4 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                    POPULAIRE
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <div className="mb-2">
                  {plan.subtitle && (
                    <span className="text-sm text-muted-foreground">
                      {plan.subtitle}{" "}
                    </span>
                  )}
                  <span className="text-4xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-2">Limites techniques :</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    • Tenants :{" "}
                    {plan.limits.tenants === -1
                      ? "Illimité"
                      : plan.limits.tenants}
                  </p>
                  <p>
                    • Membres :{" "}
                    {plan.limits.members === -1
                      ? "Illimité"
                      : plan.limits.members}
                  </p>
                  <p>
                    • Résumés IA/mois :{" "}
                    {plan.limits.aiSummaries === -1
                      ? "Illimité"
                      : plan.limits.aiSummaries}
                  </p>
                </div>
              </div>

              <Button className="w-full mt-6" variant="outline">
                <Pencil className="w-4 h-4 mr-2" />
                Modifier ce plan
              </Button>
            </div>
          ))}
        </div>

        {/* Statistiques de revenus */}
        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-xl font-semibold mb-6">Statistiques de Revenus</h2>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">0€</p>
              <p className="text-sm text-muted-foreground">MRR (Monthly Recurring Revenue)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">0€</p>
              <p className="text-sm text-muted-foreground">ARR (Annual Recurring Revenue)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">0%</p>
              <p className="text-sm text-muted-foreground">Taux de conversion FREE → PRO</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Répartition par plan :</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Plan FREE</span>
                <span className="font-semibold">0 clients (0€/mois)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Plan PRO</span>
                <span className="font-semibold">0 clients (0€/mois)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Plan ENTERPRISE</span>
                <span className="font-semibold">0 clients (0€/mois)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note :</strong> Les statistiques de revenus seront automatiquement
              calculées une fois l'intégration Stripe mise en place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
