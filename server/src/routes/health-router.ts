import { Router } from "express";
import { env } from "../config/env.js";
import { databaseInfo } from "../database/db.js";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
    response.json({
        appBaseUrl: env.appBaseUrl,
        databasePath: databaseInfo.path,
        nodeEnv: env.nodeEnv,
        status: "ok",
    });
});
