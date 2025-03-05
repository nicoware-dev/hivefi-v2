// vite.config.ts
import { defineConfig } from "file:///home/xyz/Documents/GitHub/hivefi-v2/eliza/node_modules/.pnpm/vite@5.1.4_@types+node@20.11.19_terser@5.39.0/node_modules/vite/dist/node/index.js";
import topLevelAwait from "file:///home/xyz/Documents/GitHub/hivefi-v2/eliza/node_modules/.pnpm/vite-plugin-top-level-await@1.4.4_@swc+helpers@0.5.15_rollup@4.34.9_vite@5.1.4_@types+node@20.11.19_terser@5.39.0_/node_modules/vite-plugin-top-level-await/exports/import.mjs";
import react from "file:///home/xyz/Documents/GitHub/hivefi-v2/eliza/node_modules/.pnpm/@vitejs+plugin-react@4.2.1_vite@5.1.4_@types+node@20.11.19_terser@5.39.0_/node_modules/@vitejs/plugin-react/dist/index.mjs";
import wasm from "file:///home/xyz/Documents/GitHub/hivefi-v2/eliza/node_modules/.pnpm/vite-plugin-wasm@3.3.0_vite@5.1.4_@types+node@20.11.19_terser@5.39.0_/node_modules/vite-plugin-wasm/exports/import.mjs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
var __vite_injected_original_import_meta_url = "file:///home/xyz/Documents/GitHub/hivefi-v2/eliza/client/vite.config.ts";
var __dirname = dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var vite_config_default = defineConfig({
  plugins: [wasm(), topLevelAwait(), react()],
  optimizeDeps: {
    exclude: ["onnxruntime-node", "@anush008/tokenizers"],
    esbuildOptions: {
      target: "es2020"
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    commonjsOptions: {
      exclude: ["onnxruntime-node", "@anush008/tokenizers"],
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: ["onnxruntime-node", "@anush008/tokenizers"],
      output: {
        manualChunks: {
          "recharts": ["recharts"],
          "d3": ["d3-shape", "d3-path"]
        }
      }
    },
    target: "es2020"
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "d3-shape": "d3-shape"
    }
  },
  define: {
    "process.env": {
      NEXT_PUBLIC_SONIC_NETWORK: process.env.NEXT_PUBLIC_SONIC_NETWORK || "mainnet"
    },
    // Polyfill global objects
    global: "globalThis"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS94eXovRG9jdW1lbnRzL0dpdEh1Yi9oaXZlZmktdjIvZWxpemEvY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS94eXovRG9jdW1lbnRzL0dpdEh1Yi9oaXZlZmktdjIvZWxpemEvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3h5ei9Eb2N1bWVudHMvR2l0SHViL2hpdmVmaS12Mi9lbGl6YS9jbGllbnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHRvcExldmVsQXdhaXQgZnJvbSBcInZpdGUtcGx1Z2luLXRvcC1sZXZlbC1hd2FpdFwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHdhc20gZnJvbSBcInZpdGUtcGx1Z2luLXdhc21cIjtcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XG5pbXBvcnQgeyBkaXJuYW1lLCByZXNvbHZlIH0gZnJvbSAnbm9kZTpwYXRoJztcblxuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIHBsdWdpbnM6IFt3YXNtKCksIHRvcExldmVsQXdhaXQoKSwgcmVhY3QoKV0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICAgIGV4Y2x1ZGU6IFtcIm9ubnhydW50aW1lLW5vZGVcIiwgXCJAYW51c2gwMDgvdG9rZW5pemVyc1wiXSxcbiAgICAgICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgICAgICAgIHRhcmdldDogJ2VzMjAyMCdcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICAgIHByb3h5OiB7XG4gICAgICAgICAgICAnL2FwaSc6IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgICBjb21tb25qc09wdGlvbnM6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IFtcIm9ubnhydW50aW1lLW5vZGVcIiwgXCJAYW51c2gwMDgvdG9rZW5pemVyc1wiXSxcbiAgICAgICAgICAgIGluY2x1ZGU6IFsvbm9kZV9tb2R1bGVzL10sXG4gICAgICAgICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgICBleHRlcm5hbDogW1wib25ueHJ1bnRpbWUtbm9kZVwiLCBcIkBhbnVzaDAwOC90b2tlbml6ZXJzXCJdLFxuICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICAgICAgICAgICdyZWNoYXJ0cyc6IFsncmVjaGFydHMnXSxcbiAgICAgICAgICAgICAgICAgICAgJ2QzJzogWydkMy1zaGFwZScsICdkMy1wYXRoJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRhcmdldDogJ2VzMjAyMCdcbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgIFwiQFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgICAgICAgIFwiZDMtc2hhcGVcIjogJ2QzLXNoYXBlJ1xuICAgICAgICB9XG4gICAgfSxcbiAgICBkZWZpbmU6IHtcbiAgICAgICAgJ3Byb2Nlc3MuZW52Jzoge1xuICAgICAgICAgICAgTkVYVF9QVUJMSUNfU09OSUNfTkVUV09SSzogcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU09OSUNfTkVUV09SSyB8fCAnbWFpbm5ldCcsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIFBvbHlmaWxsIGdsb2JhbCBvYmplY3RzXG4gICAgICAgIGdsb2JhbDogJ2dsb2JhbFRoaXMnLFxuICAgIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVUsU0FBUyxvQkFBb0I7QUFDbFcsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQUM5QixTQUFTLFNBQVMsZUFBZTtBQUx5SyxJQUFNLDJDQUEyQztBQU8zUCxJQUFNLFlBQVksUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFFeEQsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsU0FBUyxDQUFDLEtBQUssR0FBRyxjQUFjLEdBQUcsTUFBTSxDQUFDO0FBQUEsRUFDMUMsY0FBYztBQUFBLElBQ1YsU0FBUyxDQUFDLG9CQUFvQixzQkFBc0I7QUFBQSxJQUNwRCxnQkFBZ0I7QUFBQSxNQUNaLFFBQVE7QUFBQSxJQUNaO0FBQUEsRUFDSjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osT0FBTztBQUFBLE1BQ0gsUUFBUTtBQUFBLFFBQ0osUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1o7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0gsaUJBQWlCO0FBQUEsTUFDYixTQUFTLENBQUMsb0JBQW9CLHNCQUFzQjtBQUFBLE1BQ3BELFNBQVMsQ0FBQyxjQUFjO0FBQUEsTUFDeEIseUJBQXlCO0FBQUEsSUFDN0I7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNYLFVBQVUsQ0FBQyxvQkFBb0Isc0JBQXNCO0FBQUEsTUFDckQsUUFBUTtBQUFBLFFBQ0osY0FBYztBQUFBLFVBQ1YsWUFBWSxDQUFDLFVBQVU7QUFBQSxVQUN2QixNQUFNLENBQUMsWUFBWSxTQUFTO0FBQUEsUUFDaEM7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBQ0EsUUFBUTtBQUFBLEVBQ1o7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILEtBQUssUUFBUSxXQUFXLE9BQU87QUFBQSxNQUMvQixZQUFZO0FBQUEsSUFDaEI7QUFBQSxFQUNKO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixlQUFlO0FBQUEsTUFDWCwyQkFBMkIsUUFBUSxJQUFJLDZCQUE2QjtBQUFBLElBQ3hFO0FBQUE7QUFBQSxJQUVBLFFBQVE7QUFBQSxFQUNaO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
