import "reflect-metadata";
import express from "express";
import "./infra/DI/container";
import { AppDataSource } from "./infra/typeORM/config";
import { routes } from "./routes";

import "dotenv/config";

async function main() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  try {
    await AppDataSource.initialize();
    console.log("Data base running...");

    await AppDataSource.runMigrations();
    console.log("Migrations executed...");

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.use(routes);

    app.listen(port, () => {
      console.log(`🚀 Produtos service running on port ${port}`);
    });
  } catch (error) {
    console.error("Error during application initialization:", error);
    process.exit(1);
  }
}

main();
