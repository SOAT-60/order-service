import { inject, injectable } from "inversify";
import { IGetPaymentStatusOrderUseCase } from "./interface/order.usecase.interface";
import { OrderRepository } from "../repository/order.repository.interface";
import { Order } from "../models/order.model";

@injectable()
export class GetPaymentStatusOrderUseCase
  implements IGetPaymentStatusOrderUseCase
{
  constructor(
    @inject("OrderRepository")
    private readonly repository: OrderRepository
  ) {}
  async getPaymentStatus(code: string): Promise<string> {
    try {
      const order = await this.repository.findByCode(code);

      if (!order) {
        throw new Error(
          JSON.stringify({ message: "Pedido não encontrado!", status: 404 })
        );
      }

      return order.paymentStatus;
    } catch (error) {
      throw error;
    }
  }
}
