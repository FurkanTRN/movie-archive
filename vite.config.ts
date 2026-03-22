import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        if (id.includes("react-aria")) {
                            return "react-aria";
                        }

                        if (id.includes("react-router")) {
                            return "react-router";
                        }

                        if (id.includes("react")) {
                            return "react-vendor";
                        }
                    }

                    if (id.includes("/src/components/application/archive/")) {
                        return "archive-ui";
                    }

                    if (id.includes("/src/pages/archive-page.tsx")) {
                        return "archive-page";
                    }

                    return undefined;
                },
            },
        },
    },
});
