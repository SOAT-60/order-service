import { injectable } from "inversify";
import { OrderRepository } from "../../../repository/order.repository.interface";
import { Repository } from "typeorm";
import { OrderEntity } from "../entities/order";
import { OrderItemEntity } from "../entities/oderItems";
import { AppDataSource } from "../config";
import { CreateOrderRequestDTO } from "../../../dtos/create-order.dto";
import { Order } from "../../../models/order.model";
import { findWithOrder } from "./order.query-builder";

@injectable()
export class OrderRepositoryImpl implements OrderRepository {
  private repository: Repository<OrderEntity>;
  private orderItemRepository: Repository<OrderItemEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(OrderEntity);
    this.orderItemRepository = AppDataSource.getRepository(OrderItemEntity);
  }
  async create(
    order: CreateOrderRequestDTO & { totalPrice: number }
  ): Promise<Order | null> {
    const orderData = this.repository.create({
      orderDate: order.orderDate,
      status: order.status,
      code: order.code,
      paymentStatus: "PENDING",
      items: order.items.map((item) => ({
        quantity: item.quantity,
        snapshot_price: item.price,
        item_id: item.productId,
      })),
    });

    const result = await this.repository.save(orderData);

    return result;
  }

  async listOrders(): Promise<Order[]> {
    const result = await findWithOrder("orders", {
      orderBy: [
        {
          field: "status",
          direction: "ASC",
          customOrder: { PRONTO: 1, PREPARACAO: 2, RECEBIDO: 3 },
        },
        { field: "orderDate", direction: "ASC" },
      ],
      relations: ["items"],
    });

    return result
      .map((order) => {
        const items = order.items.map((item: any) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        }));

        const totalPrice = items?.reduce((acc: number, item: any) => {
          return acc + item.snapshot_price * item.quantity;
        }, 0);

        return {
          id: order?.id,
          orderDate: order?.orderDate,
          status: order?.status,
          items,
          totalPrice,
          code: order?.code,
          paymentStatus: order?.paymentStatus,
        };
      })
      .filter((order) => order !== null);
  }

  async findOrder(
    id: number
  ): Promise<(Order & { totalPrice: number }) | null> {
    const result = await this.repository.findOne({
      where: { id },
      relations: ["items"],
    });

    if (!result) return null;
    const items = result?.items.map((item: any) => ({
      ...item,
    }));

    const totalPrice = items?.reduce((acc: number, item: any) => {
      return acc + item.price * item.quantity;
    }, 0);

    return {
      id: result?.id,
      orderDate: result?.orderDate,
      status: result?.status,
      code: result?.code,
      paymentStatus: result?.paymentStatus,
      items,
      totalPrice,
    };
  }

  async updateOrderStatus(id: number, status: string): Promise<void> {
    await this.repository.update({ id }, { status });
  }

  async findByCode(
    code: string
  ): Promise<(Order & { totalPrice: number }) | null> {
    const result = await this.repository.findOne({
      where: { code },
      relations: ["items"],
    });

    if (!result) return null;

    const items = result?.items.map((item: any) => ({
      ...item,
    }));

    const totalPrice = items?.reduce((acc: number, item: any) => {
      return acc + item.snapshot_price * item.quantity;
    }, 0);

    return {
      id: result?.id,
      orderDate: result?.orderDate,
      status: result?.status,
      code: result?.code,
      paymentStatus: result?.paymentStatus,
      items,
      totalPrice,
    };
  }
}
