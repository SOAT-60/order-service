import { DataSource } from "typeorm";
import { OrderEntity } from "./entities/order";

import "dotenv/config";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.MYSQL_HOST || "localhost",
  port: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || "soat_desafio_order_service",
  logging: true,
  synchronize: false,
  entities: [OrderEntity],
});
