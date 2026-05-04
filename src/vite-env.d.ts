/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FETCH_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
