import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItemEntity } from "./oderItems";

@Entity("orders")
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("datetime")
  orderDate: Date;

  @Column("varchar")
  status: string;

  @Column("varchar")
  code: string;

  @Column("varchar", { default: "PENDING" })
  paymentStatus: string;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items: OrderItemEntity[];
}
