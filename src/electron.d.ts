interface MeshForgeNativeFile {
  name: string;
  path: string;
  bytes: Uint8Array;
}

interface MeshForgeSavePayload {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  bytes: ArrayBuffer | Uint8Array;
}

interface MeshForgeSaveResult {
  canceled: boolean;
  filePath?: string;
}

declare global {
  interface Window {
    meshforge?: {
      isDesktop: boolean;
      openModel: () => Promise<MeshForgeNativeFile | null>;
      saveFile: (payload: MeshForgeSavePayload) => Promise<MeshForgeSaveResult>;
      getPaths: () => Promise<{ userData: string; documents: string }>;
      minimize: () => void;
      toggleMaximize: () => void;
      close: () => void;
    };
  }
}

export {};
