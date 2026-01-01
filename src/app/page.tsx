export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          ORIZON
        </h1>
        <p className="text-xl text-center">
          Plateforme SaaS multitenant de gestion d'événements et festivals
        </p>
        <div className="glass-card p-8 rounded-2xl">
          <p className="text-center text-muted-foreground">
            🚀 Projet en cours de développement - Phase 1 MVP
          </p>
        </div>
      </div>
    </main>
  );
}
