import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useAuth } from "@/providers/auth-provider";
import { ApiError } from "@/utils/api-client";
import { loginFormSchema } from "@/validation/forms";
import { z } from "zod";

interface LocationState {
    from?: string;
}

export const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isPending, login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<"email" | "password", string>>>({});

    const from = (location.state as LocationState | null)?.from || "/";

    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setFieldErrors({});

        try {
            const values = loginFormSchema.parse({ email, password });
            await login(values);
            navigate(from, { replace: true });
        } catch (submitError) {
            if (submitError instanceof z.ZodError) {
                const nextErrors: Partial<Record<"email" | "password", string>> = {};

                for (const issue of submitError.issues) {
                    const field = issue.path[0];

                    if (field === "email" || field === "password") {
                        nextErrors[field] = issue.message;
                    }
                }

                setFieldErrors(nextErrors);
                return;
            }

            setError(submitError instanceof ApiError ? submitError.message : "Giriş başarısız");
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-secondary px-4 py-10">
            <div className="absolute inset-x-0 top-0 h-72 bg-linear-to-b from-brand-secondary/15 via-brand-secondary/5 to-transparent" />
            <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
                <section className="w-full max-w-xl rounded-[28px] border border-secondary bg-primary px-5 py-8 shadow-2xl shadow-brand-secondary/10 sm:px-8 lg:px-12">
                    <div className="mt-2">
                        <h2 className="text-display-sm font-semibold text-primary">Giriş yap</h2>
                    </div>

                    <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
                        <Input
                            label="E-posta"
                            placeholder="user@example.com"
                            value={email}
                            onChange={setEmail}
                            isInvalid={Boolean(fieldErrors.email)}
                            hint={fieldErrors.email}
                        />
                        <Input
                            label="Şifre"
                            placeholder="••••••••"
                            type="password"
                            value={password}
                            onChange={setPassword}
                            isInvalid={Boolean(fieldErrors.password)}
                            hint={fieldErrors.password}
                        />

                        {error && <div className="rounded-xl border border-error_subtle bg-error-primary px-4 py-3 text-sm text-error-primary">{error}</div>}

                        <Button size="lg" type="submit" isLoading={isPending}>
                            Giriş yap
                        </Button>
                    </form>
                </section>
            </div>
        </div>
    );
};
