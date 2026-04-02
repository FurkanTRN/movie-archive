import { Suspense, StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { ProtectedRoute } from "@/components/application/auth/protected-route";
import { AuthProvider } from "@/providers/auth-provider";
import { RouteProvider } from "@/providers/router-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";

const ArchivePage = lazy(async () => {
    const module = await import("@/pages/archive-page");
    return { default: module.ArchivePage };
});

const LoginPage = lazy(async () => {
    const module = await import("@/pages/login-page");
    return { default: module.LoginPage };
});

const NotFound = lazy(async () => {
    const module = await import("@/pages/not-found");
    return { default: module.NotFound };
});

const appFallback = (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
        <div className="rounded-2xl border border-secondary bg-primary px-5 py-4 text-sm text-tertiary shadow-xs">Loading...</div>
    </div>
);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <BrowserRouter>
                <RouteProvider>
                    <AuthProvider>
                        <Suspense fallback={appFallback}>
                            <Routes>
                                <Route path="/login" element={<LoginPage />} />
                                <Route
                                    path="/"
                                    element={
                                        <ProtectedRoute>
                                            <ArchivePage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Suspense>
                    </AuthProvider>
                </RouteProvider>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
);
