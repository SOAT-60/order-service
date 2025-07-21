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

      const formmattedOrders = orders.filter((order) => {
        return order.status !== "FINALIZADO";
      });

      return formmattedOrders;
    } catch (error) {
      throw error;
    }
  }
}
