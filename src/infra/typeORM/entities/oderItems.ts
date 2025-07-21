import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderEntity } from "./order";

@Entity("order_items")
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int")
  quantity: number;

  @Column("decimal", { precision: 10, scale: 2 })
  snapshot_price: number;

  @Column("int")
  item_id: number;

  @ManyToOne(() => OrderEntity, (order) => order.items)
  @JoinColumn({ name: "order_id" })
  order: OrderEntity;
}
