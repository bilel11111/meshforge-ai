# Third-party notices

MeshForge AI includes or depends on open-source packages. This file records the direct dependencies declared in `package.json` and the license metadata resolved in `package-lock.json`.

These notices do not replace the license files shipped by the respective packages. When creating a customer installer, preserve the upstream copyright and license texts and include this notice in the distribution or an accessible About/Legal screen.

| Package | Resolved version | License |
|---|---:|---|
| `@google/genai` | 2.17.1 | Apache-2.0 |
| `@tailwindcss/vite` | 4.3.3 | MIT |
| `@vitejs/plugin-react` | 5.2.0 | MIT |
| `autoprefixer` | 10.5.4 | MIT |
| `concurrently` | 9.2.4 | MIT |
| `dotenv` | 17.4.2 | BSD-2-Clause |
| `electron` | 37.10.3 | MIT |
| `electron-builder` | 26.15.3 | MIT |
| `esbuild` | 0.25.12 | MIT |
| `express` | 4.22.2 | MIT |
| `lucide-react` | 0.546.0 | ISC |
| `motion` | 12.43.0 | MIT |
| `react` | 19.2.8 | MIT |
| `react-dom` | 19.2.8 | MIT |
| `tailwindcss` | 4.3.3 | MIT |
| `three` | 0.185.1 | MIT |
| `tsx` | 4.23.12 | MIT |
| `typescript` | 5.8.3 | Apache-2.0 |
| `vite` | 6.4.3 | MIT |
| `wait-on` | 8.0.5 | MIT |

The type packages (`@types/express`, `@types/node`, and `@types/three`) are development-only dependencies and are reported as MIT in the lockfile.

## Important obligations

The MIT, BSD-2-Clause, ISC, and Apache-2.0 licenses generally permit commercial use, modification, and distribution subject to their conditions. In particular, preserve applicable copyright, license, attribution, and NOTICE information. Apache-2.0 components may also require preservation of NOTICE information and prominent notices for modified files.

The complete transitive dependency graph can change when the lockfile changes. Before each customer release, regenerate this inventory and verify the actual packaged dependency tree rather than relying only on this summary.

## Primary upstream references

- [Three.js license](https://github.com/mrdoob/three.js/blob/dev/LICENSE)
- [Electron license](https://github.com/electron/electron/blob/main/LICENSE)
- [Google Gen AI SDK license](https://github.com/googleapis/js-genai/blob/main/LICENSE)
