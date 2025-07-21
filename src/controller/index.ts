import { inject, injectable } from "inversify";
import { CreateOrderRequestDTO } from "../dtos/create-order.dto";
import {
  ICreateOrderUseCase,
  IGetPaymentStatusOrderUseCase,
  IListOrderUseCase,
  IUpdateStatusOrderUseCase,
} from "../usecases/interface/order.usecase.interface";

@injectable()
export class OrderController {
  constructor(
    @inject("CreateOrderUseCase")
    private readonly createOrderUseCase: ICreateOrderUseCase,
    @inject("ListOrderUseCase")
    private readonly listOrderUseCase: IListOrderUseCase,
    @inject("GetPaymentStatusOrderUseCase")
    private readonly getPaymentStatusOrderUseCase: IGetPaymentStatusOrderUseCase,
    @inject("UpdateStatusOrderUseCase")
    private readonly updateStatusOrderUseCase: IUpdateStatusOrderUseCase
  ) {}

  async createOrder(orderData: CreateOrderRequestDTO) {
    const order = await this.createOrderUseCase.createOrder(orderData);
    return order;
  }

  async listOrders() {
    const orders = await this.listOrderUseCase.listOrders();
    return orders;
  }

  async getPaymentStatus(code: string) {
    const orders = await this.getPaymentStatusOrderUseCase.getPaymentStatus(
      code
    );
    return orders;
  }

  async updateStatus(updateData: { id: number; status: string }) {
    const orders = await this.updateStatusOrderUseCase.updateOrderStatus(
      updateData
    );
    return orders;
  }
}
