/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // add more env variables here as you need them
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
