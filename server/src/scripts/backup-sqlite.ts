import { createBackup } from "../backup/backup-utils.js";

const run = async () => {
    const backupPath = await createBackup();
    console.log(`SQLite yedeği oluşturuldu: ${backupPath}`);
};

run().catch((error) => {
    console.error("SQLite yedeği oluşturulamadı.");
    console.error(error);
    process.exit(1);
});
