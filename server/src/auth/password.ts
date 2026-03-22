import bcrypt from "bcryptjs";

const saltRounds = 12;

export const hashPassword = async (password: string) => {
    return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, passwordHash: string) => {
    return bcrypt.compare(password, passwordHash);
};
