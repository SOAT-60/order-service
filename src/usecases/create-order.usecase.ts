import { inject, injectable } from "inversify";
import { ICreateOrderUseCase } from "./interface/order.usecase.interface";
import { CreateOrderRequestDTO } from "../dtos/create-order.dto";
import { Order } from "../models/order.model";
import { OrderRepository } from "../repository/order.repository.interface";
import { ProductService } from "../services/product.service.interface";

@injectable()
export class CreateOrderUseCase implements ICreateOrderUseCase {
  constructor(
    @inject("OrderRepository")
    private readonly repository: OrderRepository,
    @inject("ProductService")
    private readonly service: ProductService
  ) {}

  async createOrder(
    orderData: CreateOrderRequestDTO
  ): Promise<{ order: Order | null; errors: { productId: number }[] } | null> {
    try {
      const itemsArray: {
        productId: number;
        quantity: number;
        price: number;
        snapshot_name: string;
      }[] = [];

      const itemsError: {
        productId: number;
      }[] = [];

      for (const item of orderData.items) {
        const foundProduct = await this.service.findById(item.productId);
        if (!foundProduct.error && foundProduct.product) {
          itemsArray.push({
            productId: foundProduct.product?.id,
            quantity: item.quantity,
            price: foundProduct.product.price,
            snapshot_name: foundProduct.product.name,
          });
        } else {
          itemsError.push({ productId: item.productId });
        }
      }

      const totalPrice = itemsArray.reduce((acc, item) => {
        return acc + item.price * item.quantity;
      }, 0);

      const order = await this.repository.create({
        orderDate: orderData.orderDate,
        status: orderData.status,
        items: itemsArray,
        totalPrice,
        code: orderData.code,
      });

      return { order: order ?? null, errors: itemsError };
    } catch (error) {
      throw error;
    }
  }
}
