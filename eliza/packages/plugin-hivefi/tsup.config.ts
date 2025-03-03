import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    sourcemap: true,
    clean: true,
    format: ["cjs"],
    target: "node16",
    platform: "node",
    bundle: true,
    minify: false,
    skipNodeModulesBundle: true,
    external: [
        "dotenv",
        "fs",
        "path",
        "util",
        "stream",
        "http",
        "https",
        "events",
        "crypto",
        "zlib",
        "@reflink/reflink",
        "@node-llama-cpp",
        "agentkeepalive",
        "@ai16z/eliza",
        "form-data",
        "combined-stream"
    ]
});
