import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite = new Database(path.join(__dirname, "../../tetris-hub.db"));
const db = drizzle(sqlite);

console.log("Запуск миграций...");
migrate(db, { migrationsFolder: path.join(__dirname, "../../drizzle") });
console.log("Миграции успешно применены!");

sqlite.close();
