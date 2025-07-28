import { inject, injectable } from "inversify";
import { IListOrderUseCase } from "./interface/order.usecase.interface";
import { Order } from "../models/order.model";
import { OrderRepository } from "../repository/order.repository.interface";

@injectable()
export class ListOrderUseCase implements IListOrderUseCase {
  constructor(
    @inject("OrderRepository")
    private readonly repository: OrderRepository
  ) {}

  async listOrders(): Promise<Order[]> {
    try {
      const orders = await this.repository.listOrders();

      if (!orders) {
        throw new Error(
          JSON.stringify({ message: "Nenhum pedido encontrado!", status: 404 })
        );
      }

      const formattedOrders = orders
        .filter((order) => order.status !== "FINALIZADO")
        .map((order) => ({
          ...order,
          items:
            order.items?.map((item) => ({
              id: item.id,
              quantity: item.quantity,
              snapshot_price: item.snapshot_price,
              item_id: item.item_id,
              snapshot_name: item.snapshot_name,
            })) || [],
          totalPrice:
            order.items?.reduce((acc, item) => {
              return acc + item.snapshot_price * item.quantity;
            }, 0) || 0,
        }));

      return formattedOrders;
    } catch (error) {
      throw error;
    }
  }
}
