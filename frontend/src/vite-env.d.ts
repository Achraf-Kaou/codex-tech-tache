interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Ajoutez d'autres variables d'environnement ici si nécessaire
  // readonly VITE_AUTRE_VAR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}