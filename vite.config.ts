import { svelteTesting } from "@testing-library/svelte/vite";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import path from "node:path";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    fs: {
      // Yarn PnP + ZipFS places dependencies under .yarn/; allow Vite to serve them in dev.
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        path.resolve(process.cwd(), ".yarn"),
        path.resolve(process.cwd(), ".pnp.cjs"),
        path.resolve(process.cwd(), ".pnp.loader.mjs"),
      ],
    },
    watch: {
      ignored: ["**/.github/**", "**/docs/**"],
    },
  },
  test: {
    workspace: [
      {
        extends: "./vite.config.ts",
        plugins: [svelteTesting()],
        test: {
          name: "client",
          environment: "jsdom",
          clearMocks: true,
          include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          exclude: ["src/lib/server/**"],
          setupFiles: ["./vitest-setup-client.ts"],
        },
      },
      {
        extends: "./vite.config.ts",
        test: {
          name: "server",
          environment: "node",
          include: ["src/**/*.{test,spec}.{js,ts}"],
          exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
        },
      },
    ],
  },
});
