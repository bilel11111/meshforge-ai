# MeshForge AI — Electron 3D Asset Workbench

MeshForge AI is a cross-platform Windows and Linux desktop 3D asset workbench built with Electron and Three.js. It combines procedural mesh generation, optional cloud or local model integrations, PBR material synthesis, a live 3D viewport, and export workflows for GLB, OBJ, STL, PNG snapshots, and Blender Python.

> **Commercial product:** the source repository is private. A valid commercial order is required before any customer receives source access, a license key, or a compiled distribution.

## Product overview

MeshForge AI is designed for creators, technical artists, game developers, product teams, and studios that need a practical 3D asset workflow without committing every operation to a cloud service.

| Area | Product capabilities |
|---|---|
| Asset creation | Procedural mesh generation, presets, asset tree, sub-components, and model import |
| AI-assisted workflows | Optional Gemini generation, image-to-3D assistance, and local Ollama/vLLM/LM Studio integrations |
| Editing | Twist, taper, bend, noise, spherify, extrude-spikes, and subdivision operations |
| Materials | Procedural PBR maps and controls for color, roughness, metalness, emission, and related properties |
| Viewport | Orbit controls, orthographic views, grid, axes, wireframe, auto-rotation, and snapshots |
| Export | GLB, OBJ, STL, PNG snapshots, and Blender Python scripts |
| Desktop delivery | Electron application with native file dialogs and Windows/Linux packaging |

## Commercial editions

The recommended sales model is a **per-seat or per-installation commercial license**. The exact number of seats, permitted devices, support level, update period, and pricing should be written in the buyer's order or commercial agreement.

The repository's [`LICENSE`](LICENSE) is a working proprietary-license draft. It does not grant public download rights and should be reviewed by qualified legal counsel before customer use. Third-party packages remain subject to their own licenses; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## Distribution strategy

Keep the full source code and release artifacts in this private repository. For a public CV or portfolio, create a separate showcase repository containing only the product description, screenshots, a feature list, a short demo video, requirements, and a sales contact. Do not publish this source repository if the goal is to sell the implementation.

A public GitHub repository can be viewed, cloned, and downloaded. GitHub cannot provide a public-but-non-downloadable source repository.

## Runtime options

The procedural engine works locally without a cloud API key. Optional integrations can use Gemini or a locally detected Ollama, vLLM, or LM Studio endpoint. Cloud providers, model weights, quotas, hosting, and generated output are separate from the MeshForge AI license and remain subject to their respective terms.

## Development

The current development workflow requires Node.js 20 or later and npm:

```bash
npm install
npm run dev
```

The browser development server runs on `http://localhost:3000`. To launch the Electron development shell:

```bash
npm run dev:desktop
```

Copy `.env.example` to `.env` only when using optional configuration. Never commit API keys, private endpoints, credentials, or customer data.

## Build and packaging

Run the type check and production build with:

```bash
npm run lint
npm run build
```

Create Linux packages with:

```bash
npm run desktop:linux
```

Create a Windows NSIS installer in a Windows or Wine-capable packaging environment with:

```bash
npm run desktop:windows
```

Release artifacts should be signed, checksummed, and distributed through a controlled customer channel. The current project documentation records known packaging limitations in [`docs/BUILD_GUIDE.md`](docs/BUILD_GUIDE.md).

## Architecture

The Electron main process starts the local Express service and opens the renderer. The preload bridge uses context isolation and exposes only the native operations needed by the application. The renderer is built with React, Vite, Tailwind CSS, and Three.js. The server layer coordinates optional Gemini and local-model integrations with procedural fallbacks.

## Security and customer responsibilities

API keys belong in the customer's local environment or approved secret-management system. Do not embed provider keys in the renderer, commit them to Git, or ship one customer's credentials to another customer. Customers should review imported assets, generated code, model outputs, and exported files before using them in production.

## Support and sales

For commercial licensing, private source access, compiled installers, custom integrations, or support inquiries, contact **bileljammazi6@gmail.com**. Before sale, define the customer's license scope, delivery format, support period, update entitlement, refund terms, and applicable jurisdiction in a signed order or agreement.

## Author

**Bilel JM / MeshForge AI**
