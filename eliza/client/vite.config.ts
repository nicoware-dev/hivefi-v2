import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [wasm(), topLevelAwait(), react()],
    optimizeDeps: {
        exclude: ["onnxruntime-node", "@anush008/tokenizers"],
        esbuildOptions: {
            target: 'es2020'
        }
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
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
                    'recharts': ['recharts'],
                    'd3': ['d3-shape', 'd3-path']
                }
            }
        },
        target: 'es2020'
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
            "d3-shape": 'd3-shape'
        }
    },
    define: {
        'process.env': {
            NEXT_PUBLIC_SONIC_NETWORK: process.env.NEXT_PUBLIC_SONIC_NETWORK || 'mainnet',
        },
        // Polyfill global objects
        global: 'globalThis',
    },
});
