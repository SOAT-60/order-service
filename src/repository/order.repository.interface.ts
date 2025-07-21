import { CreateOrderRequestDTO } from "../dtos/create-order.dto";
import { Order } from "../models/order.model";

export interface OrderRepository {
  create(
    order: CreateOrderRequestDTO & { totalPrice: number }
  ): Promise<Order | null>;

  listOrders(): Promise<Order[]>;

  findOrder(id: number): Promise<Order | null>;

  findByCode(code: string): Promise<Order | null>;

  updateOrderStatus(id: number, status: string): Promise<void>;
}
