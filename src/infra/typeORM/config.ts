import { DataSource } from "typeorm";
import { OrderEntity } from "./entities/order";
import { OrderItemEntity } from "./entities/oderItems";

import "dotenv/config";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || " pedidos_service",
  logging: true,
  synchronize: false,
  entities: [OrderEntity, OrderItemEntity],
  migrations: [__dirname + "/migrations/*.{ts,js}"],
});
