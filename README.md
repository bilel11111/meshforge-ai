# MeshForge AI

MeshForge AI est un **atelier desktop de création d’assets 3D** pour Linux et Windows. La reconstruction conserve le moteur Three.js et les générateurs procéduraux du projet fourni, tout en ajoutant un shell Electron, une interface de studio cross-platform et des dialogues de fichiers natifs.

> Le mode procédural fonctionne localement sans clé API. Les intégrations Gemini, Ollama, vLLM et LM Studio sont optionnelles et l’application retombe automatiquement sur le moteur local si un service distant n’est pas disponible.

## Fonctionnalités disponibles

| Domaine | Fonctionnalités opérationnelles |
|---|---|
| Assets | Arbre d’asset, presets, ajout de sous-composants et import GLB/GLTF/OBJ/STL |
| Génération | Génération text-to-3D via Gemini ou modèle local, avec fallback procédural |
| Image to 3D | Reconstruction multimodale optionnelle et relief photométrique local |
| Edition | Déformations twist, taper, bend, noise, spherify, extrude-spikes et subdivide |
| Matériaux | Génération de cartes PBR procédurales et réglages de couleur, rugosité, métal et émission |
| Viewport | Orbit controls, vues ISO/front/top/side, grille, axes, wireframe, autorotation et snapshot |
| Export | GLB, OBJ, STL, snapshot PNG et script Python Blender |
| Desktop | Fenêtre Electron, titre-barre cross-platform, contrôles de fenêtre et sauvegarde via dialogue natif |

## Développement local

Les prérequis sont Node.js 20 ou supérieur et npm. Installez les dépendances puis démarrez le serveur de développement :

```bash
npm install
npm run dev
```

L’application navigateur est ensuite disponible sur `http://localhost:3000`. Pour démarrer directement la version desktop Electron en mode développement :

```bash
npm run dev:desktop
```

Les appels Gemini nécessitent une variable `GEMINI_API_KEY` dans un fichier `.env` ou `.env.local`. Sans cette variable, la génération procédurale locale reste disponible. Les services locaux sont détectés sur les endpoints Ollama `11434`, vLLM `8000` et LM Studio `1234`.

## Compilation et packaging

La vérification TypeScript et le build de production sont lancés avec :

```bash
npm run lint
npm run build
```

Sur Linux, les installateurs AppImage et Debian sont générés avec :

```bash
npm run desktop:linux
```

Sur Windows, l’installateur NSIS est généré avec :

```bash
npm run desktop:windows
```

Depuis Linux, si Wine n’est pas disponible pour finaliser NSIS, le build Windows portable peut être créé sous forme d’archive ZIP :

```bash
npm run build
./node_modules/.bin/electron-builder --win dir
cd dist && zip -qr MeshForge-AI-1.0.0-win-x64.zip win-unpacked
```

Le dossier `win-unpacked` contient alors `MeshForge AI.exe` et toutes les ressources nécessaires à l’exécution sur Windows x64.

## Architecture desktop

Le renderer React/Vite reste isolé du système avec `contextIsolation` activé et `nodeIntegration` désactivé. Le processus principal Electron lance le serveur Express local, attend son endpoint `/api/health`, puis ouvre le renderer. Le preload n’expose que les opérations nécessaires : ouvrir un modèle, sauvegarder un fichier, lire les chemins utilisateur et contrôler la fenêtre.

En mode production installé, le serveur est lancé depuis `dist/server.cjs` décompressé par Electron Builder, tandis que le renderer est servi depuis les assets Vite packagés. Cette séparation permet de conserver un mode navigateur simple pour le développement et un mode desktop natif pour les utilisateurs finaux.

## Structure utile

```text
electron/main.cjs       Processus principal, fenêtre et serveur local
electron/preload.cjs    Bridge IPC sécurisé
server.ts               API locale Gemini / modèles locaux / fallback
src/App.tsx             État applicatif et routage des panneaux
src/components/         Interface et viewport Three.js
src/lib/                Générateurs, importeurs, exporteurs et texture baker
dist/                   Build renderer, serveur et artefacts packaging
```

## Limites connues

Les installateurs ne sont pas signés numériquement. La génération Windows NSIS nécessite donc une validation Windows ou un environnement de packaging avec Wine correctement initialisé ; une version Windows portable ZIP est fournie par le build Linux. Les appels IA cloud dépendent des quotas et de la disponibilité du fournisseur, mais les opérations locales principales ne nécessitent aucun service externe.
