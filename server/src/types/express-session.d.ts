import "express-session";
import type { SessionUser } from "./auth.js";

declare module "express-session" {
    interface SessionData {
        user?: SessionUser;
    }
}
