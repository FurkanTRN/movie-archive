export interface SessionUser {
    email: string;
    id: number;
}

export interface UserRecord extends SessionUser {
    createdAt: string;
    passwordHash: string;
}
