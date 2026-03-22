import { bootstrapDatabase, databaseInfo } from "../database/db.js";

bootstrapDatabase();

console.log(`Database bootstrapped at ${databaseInfo.path}`);
