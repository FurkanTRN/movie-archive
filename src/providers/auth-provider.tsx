import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState, useTransition } from "react";
import type { AuthUser } from "@/types/api";
import { ApiError, apiRequest } from "@/utils/api-client";

interface LoginInput {
    email: string;
    password: string;
}

interface AuthResponse {
    user: AuthUser;
}

interface AuthContextValue {
    isAuthenticated: boolean;
    isLoading: boolean;
    isPending: boolean;
    login: (input: LoginInput) => Promise<void>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
    user: AuthUser | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const refreshSession = async () => {
        try {
            const response = await apiRequest<AuthResponse>("/api/auth/me");
            startTransition(() => setUser(response.user));
        } catch (error) {
            if (error instanceof ApiError && error.statusCode === 401) {
                startTransition(() => setUser(null));
                return;
            }

            throw error;
        }
    };

    useEffect(() => {
        const bootstrap = async () => {
            try {
                await refreshSession();
            } finally {
                setIsLoading(false);
            }
        };

        void bootstrap();
    }, []);

    const login = async ({ email, password }: LoginInput) => {
        const response = await apiRequest<AuthResponse>("/api/auth/login", {
            body: { email, password },
            method: "POST",
        });

        startTransition(() => setUser(response.user));
    };

    const logout = async () => {
        await apiRequest("/api/auth/logout", {
            method: "POST",
        });

        startTransition(() => setUser(null));
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: Boolean(user),
                isLoading,
                isPending,
                login,
                logout,
                refreshSession,
                user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};
