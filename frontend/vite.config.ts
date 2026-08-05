import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Backend'de CORS yapılandırması yok. Tüm istekler göreli "/api/..." yoluna
// gittiği ve dev sunucusu bunları backend'e proxy'lediği için tarayıcı
// açısından same-origin olur ve CORS'a hiç ihtiyaç duyulmaz.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5100",
        changeOrigin: true,
      },
    },
  },
});
