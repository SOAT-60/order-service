import { CreateOrderRequestDTO } from "../../dtos/create-order.dto";
import { Order } from "../../models/order.model";

export interface ICreateOrderUseCase {
  createOrder(
    orderData: CreateOrderRequestDTO
  ): Promise<{ order: Order | null; errors: { productId: number }[] } | null>;
}

export interface IListOrderUseCase {
  listOrders(): Promise<Order[]>;
}

export interface IGetPaymentStatusOrderUseCase {
  getPaymentStatus(code: string): Promise<string>;
}

export interface IUpdateStatusOrderUseCase {
  updateOrderStatus(updateData: { id: number; status: string }): Promise<void>;
}
