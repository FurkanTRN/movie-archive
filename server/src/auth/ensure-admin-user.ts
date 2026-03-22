import { hashPassword } from "./password.js";
import { env } from "../config/env.js";
import { userRepository } from "../database/user-repository.js";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

interface EnsureAdminUserResult {
    reason: "created" | "existing-users" | "existing-admin" | "missing-env";
}

export const ensureAdminUser = async (): Promise<EnsureAdminUserResult> => {
    const email = env.adminEmail.trim();
    const password = env.adminPassword.trim();

    if (!email || !password) {
        return { reason: "missing-env" };
    }

    if (userRepository.countUsers() > 0) {
        return { reason: "existing-users" };
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = userRepository.findUserByEmail(normalizedEmail);

    if (existingUser) {
        return { reason: "existing-admin" };
    }

    const passwordHash = await hashPassword(password);
    userRepository.createUser(normalizedEmail, passwordHash);

    return { reason: "created" };
};
