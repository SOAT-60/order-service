import "reflect-metadata";
import { Container } from "inversify";
import { OrderRepository } from "../../repository/order.repository.interface";
import { OrderController } from "../../controller";
import {
  ICreateOrderUseCase,
  IGetPaymentStatusOrderUseCase,
  IListOrderUseCase,
  IUpdateStatusOrderUseCase,
} from "../../usecases/interface/order.usecase.interface";
import { CreateOrderUseCase } from "../../usecases/create-order.usecase";
import { ListOrderUseCase } from "../../usecases/list-order.usecase";
import { GetPaymentStatusOrderUseCase } from "../../usecases/get-payment-status-order.usecase";
import { UpdateStatusOrderUseCase } from "../../usecases/update-status-order.interface";
import { OrderRepositoryImpl } from "../typeORM/repository/order.repository";
import { ProductService } from "../../services/product.service.interface";
import { ProductServiceImpl } from "../services/product.service";

const container = new Container();
container.bind<OrderRepository>("OrderRepository").to(OrderRepositoryImpl);
container.bind<ProductService>("ProductService").to(ProductServiceImpl);
container.bind<OrderController>("OrderController").to(OrderController);
container
  .bind<ICreateOrderUseCase>("CreateOrderUseCase")
  .to(CreateOrderUseCase);
container.bind<IListOrderUseCase>("ListOrderUseCase").to(ListOrderUseCase);
container
  .bind<IGetPaymentStatusOrderUseCase>("GetPaymentStatusOrderUseCase")
  .to(GetPaymentStatusOrderUseCase);
container
  .bind<IUpdateStatusOrderUseCase>("UpdateStatusOrderUseCase")
  .to(UpdateStatusOrderUseCase);

export { container };
