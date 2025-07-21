import { inject, injectable } from "inversify";
import { IUpdateStatusOrderUseCase } from "./interface/order.usecase.interface";
import { OrderRepository } from "../repository/order.repository.interface";

@injectable()
export class UpdateStatusOrderUseCase implements IUpdateStatusOrderUseCase {
  constructor(
    @inject("OrderRepository")
    private readonly repository: OrderRepository
  ) {}

  async updateOrderStatus(updateData: {
    id: number;
    status: string;
  }): Promise<void> {
    try {
      const order = await this.repository.findOrder(updateData.id);

      if (!order) {
        throw new Error(
          JSON.stringify({ message: "Pedido não encontrado!", status: 404 })
        );
      }

      await this.repository.updateOrderStatus(updateData.id, updateData.status);
    } catch (error) {
      throw error;
    }
  }
}
