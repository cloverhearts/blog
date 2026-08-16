import { defineConfig } from "astro/config";

const base = process.env.SITE_BASE_PATH?.trim() || "/";

export default defineConfig({
  output: "static",
  trailingSlash: "always",
  base: base === "" ? "/" : base,
  srcDir: "src",
  publicDir: "public",
  outDir: "../../.artifacts/web/astro",
  build: {
    format: "directory",
  },
  vite: {
    server: {
      fs: {
        allow: ["../.."],
      },
    },
  },
});
