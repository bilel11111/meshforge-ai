# MeshForge AI — Desktop rebuild plan

## Architecture

The existing React/Vite/Three.js renderer will be preserved because its procedural mesh engine, viewport, importers, exporters, and PBR baker already perform real local work. Electron will provide the Linux/Windows desktop shell, native window lifecycle, native file dialogs, and safe save/open IPC. The existing Express service will remain as a local companion process for Gemini/local-model calls and will bind to an ephemeral localhost port selected by the desktop main process.

The desktop main process will start the compiled local server, wait for `/api/health`, create a BrowserWindow with context isolation enabled, and expose only typed file and application actions through preload IPC. The renderer will continue to work in a normal browser for development, while using native dialogs when launched in Electron.

## Functional scope

The rebuild will retain the existing tabs: Assets, Generation, Image to 3D, Edit, Refinement, and Export. Procedural generation, Three.js viewport manipulation, model import, mesh modifiers, PBR map baking, snapshot capture, and GLB/OBJ/STL/Blender exports will remain available offline. Gemini and local model integrations will be optional and will gracefully fall back to the local procedural engine when no key or local service is configured.

## Visual direction

The visual refresh will replace the macOS imitation with a neutral cross-platform studio workbench: a compact title bar with explicit application identity and window actions, a left activity rail, a structured workspace header, quieter slate surfaces, cyan-violet status accents, clearer typography hierarchy, and denser but more legible cards. The interface will be comfortable on Linux and Windows rather than pretending to be a different operating system.

## Delivery

The project will include development commands, a Linux AppImage/deb target, a Windows NSIS target, and a README section explaining local AI setup, offline behavior, and build commands. The Linux build will be verified in the sandbox; the Windows target will be configured for cross-platform packaging and built if the packaging toolchain permits it.
