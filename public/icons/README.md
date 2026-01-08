# Icônes PWA ORIZON

## Génération des Icônes

Pour générer toutes les icônes à partir d'une image source, utilisez un outil comme [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) :

```bash
npx pwa-asset-generator logo.svg ./public/icons --icon-only --padding "10%" --background "#6366f1"
```

## Tailles Requises

- 72x72 (Android)
- 96x96 (Android, Windows)
- 128x128 (Chrome Web Store)
- 144x144 (Windows)
- 152x152 (iOS)
- 192x192 (Android)
- 384x384 (Android)
- 512x512 (Android, Splash screens)

## Placeholder Temporaire

En attendant le logo final, créez des icônes temporaires avec un fond coloré et le texte "ORIZON".

Vous pouvez utiliser [RealFaviconGenerator](https://realfavicongenerator.net/) pour un générateur en ligne.
