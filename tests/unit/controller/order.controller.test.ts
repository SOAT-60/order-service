import { OrderController } from "../../../src/controller";
import {
  ICreateOrderUseCase,
  IListOrderUseCase,
  IGetPaymentStatusOrderUseCase,
  IUpdateStatusOrderUseCase,
} from "../../../src/usecases/interface/order.usecase.interface";
import { CreateOrderRequestDTO } from "../../../src/dtos/create-order.dto";
import { Order } from "../../../src/models/order.model";

describe("OrderController", () => {
  let controller: OrderController;
  let mockCreateOrderUseCase: jest.Mocked<ICreateOrderUseCase>;
  let mockListOrderUseCase: jest.Mocked<IListOrderUseCase>;
  let mockGetPaymentStatusUseCase: jest.Mocked<IGetPaymentStatusOrderUseCase>;
  let mockUpdateStatusUseCase: jest.Mocked<IUpdateStatusOrderUseCase>;

  beforeEach(() => {
    mockCreateOrderUseCase = {
      createOrder: jest.fn(),
    };

    mockListOrderUseCase = {
      listOrders: jest.fn(),
    };

    mockGetPaymentStatusUseCase = {
      getPaymentStatus: jest.fn(),
    };

    mockUpdateStatusUseCase = {
      updateOrderStatus: jest.fn(),
    };

    controller = new OrderController(
      mockCreateOrderUseCase,
      mockListOrderUseCase,
      mockGetPaymentStatusUseCase,
      mockUpdateStatusUseCase
    );
  });

  describe("createOrder", () => {
    const mockOrderData: CreateOrderRequestDTO = {
      orderDate: "2024-01-01",
      status: "PENDING",
      code: "ORDER-001",
      items: [{ productId: 1, quantity: 2 }],
    };

    const mockOrder: Order = {
      id: 1,
      orderDate: new Date("2024-01-01"),
      status: "PENDING",
      code: "ORDER-001",
      paymentStatus: "PENDING",
    };

    it("deve criar um pedido com sucesso", async () => {
      const mockResult = { order: mockOrder, errors: [] };
      mockCreateOrderUseCase.createOrder.mockResolvedValue(mockResult);

      const result = await controller.createOrder(mockOrderData);

      expect(result).toEqual(mockResult);
      expect(mockCreateOrderUseCase.createOrder).toHaveBeenCalledWith(
        mockOrderData
      );
      expect(mockCreateOrderUseCase.createOrder).toHaveBeenCalledTimes(1);
    });

    it("deve propagar erro do caso de uso", async () => {
      const error = new Error("Use case error");
      mockCreateOrderUseCase.createOrder.mockRejectedValue(error);

      await expect(controller.createOrder(mockOrderData)).rejects.toThrow(
        "Use case error"
      );
    });
  });

  describe("listOrders", () => {
    const mockOrders: Order[] = [
      {
        id: 1,
        orderDate: new Date("2024-01-01"),
        status: "PENDING",
        code: "ORDER-001",
        paymentStatus: "PENDING",
      },
    ];

    it("deve listar pedidos com sucesso", async () => {
      mockListOrderUseCase.listOrders.mockResolvedValue(mockOrders);

      const result = await controller.listOrders();

      expect(result).toEqual(mockOrders);
      expect(mockListOrderUseCase.listOrders).toHaveBeenCalledTimes(1);
    });

    it("deve propagar erro do caso de uso", async () => {
      const error = new Error("List error");
      mockListOrderUseCase.listOrders.mockRejectedValue(error);

      await expect(controller.listOrders()).rejects.toThrow("List error");
    });
  });

  describe("getPaymentStatus", () => {
    it("deve buscar status de pagamento com sucesso", async () => {
      const code = "ORDER-001";
      const status = "PAID";
      mockGetPaymentStatusUseCase.getPaymentStatus.mockResolvedValue(status);

      const result = await controller.getPaymentStatus(code);

      expect(result).toBe(status);
      expect(mockGetPaymentStatusUseCase.getPaymentStatus).toHaveBeenCalledWith(
        code
      );
      expect(
        mockGetPaymentStatusUseCase.getPaymentStatus
      ).toHaveBeenCalledTimes(1);
    });

    it("deve propagar erro do caso de uso", async () => {
      const error = new Error("Payment status error");
      mockGetPaymentStatusUseCase.getPaymentStatus.mockRejectedValue(error);

      await expect(controller.getPaymentStatus("ORDER-001")).rejects.toThrow(
        "Payment status error"
      );
    });
  });

  describe("updateStatus", () => {
    it("deve atualizar status com sucesso", async () => {
      const updateData = { id: 1, status: "PROCESSING" };
      mockUpdateStatusUseCase.updateOrderStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus(updateData);

      expect(result).toBeUndefined();
      expect(mockUpdateStatusUseCase.updateOrderStatus).toHaveBeenCalledWith(
        updateData
      );
      expect(mockUpdateStatusUseCase.updateOrderStatus).toHaveBeenCalledTimes(
        1
      );
    });

    it("deve propagar erro do caso de uso", async () => {
      const error = new Error("Update error");
      mockUpdateStatusUseCase.updateOrderStatus.mockRejectedValue(error);

      await expect(
        controller.updateStatus({ id: 1, status: "PROCESSING" })
      ).rejects.toThrow("Update error");
    });
  });
});
