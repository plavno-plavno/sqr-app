import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tsconfigPaths(), 
    tailwindcss(), 
    svgr(), 
    basicSsl(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
          dest: "",
        },
        {
          src: "node_modules/@ricky0123/vad-web/dist/silero_vad_v5.onnx",
          dest: "",
        },
        {
          src: "node_modules/.pnpm/onnxruntime-web@1.14.0/node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
          dest: "",
        },
      ],
    }),
  ],
  server: {
    host: true,
  },
});
