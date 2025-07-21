import { GetPaymentStatusOrderUseCase } from "../../../src/usecases/get-payment-status-order.usecase";
import { OrderRepository } from "../../../src/repository/order.repository.interface";
import { Order } from "../../../src/models/order.model";

describe("GetPaymentStatusOrderUseCase", () => {
  let useCase: GetPaymentStatusOrderUseCase;
  let mockRepository: jest.Mocked<OrderRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      listOrders: jest.fn(),
      findOrder: jest.fn(),
      findByCode: jest.fn(),
      updateOrderStatus: jest.fn(),
    };

    useCase = new GetPaymentStatusOrderUseCase(mockRepository);
  });

  describe("getPaymentStatus", () => {
    const mockOrder: Order = {
      id: 1,
      orderDate: new Date("2024-01-01"),
      status: "PENDING",
      code: "ORDER-001",
      paymentStatus: "PAID",
    };

    it("deve retornar status de pagamento quando pedido existe", async () => {
      mockRepository.findByCode.mockResolvedValue(mockOrder);

      const result = await useCase.getPaymentStatus("ORDER-001");

      expect(result).toBe("PAID");
      expect(mockRepository.findByCode).toHaveBeenCalledWith("ORDER-001");
      expect(mockRepository.findByCode).toHaveBeenCalledTimes(1);
    });

    it("deve lançar erro quando pedido não existe", async () => {
      mockRepository.findByCode.mockResolvedValue(null);

      await expect(useCase.getPaymentStatus("ORDER-999")).rejects.toThrow();

      const error = await useCase.getPaymentStatus("ORDER-999").catch((e) => e);
      const parsedError = JSON.parse(error.message);
      expect(parsedError.message).toBe("Pedido não encontrado!");
      expect(parsedError.status).toBe(404);
      expect(mockRepository.findByCode).toHaveBeenCalledWith("ORDER-999");
    });

    it("deve lançar erro quando repository falha", async () => {
      const repositoryError = new Error("Database error");
      mockRepository.findByCode.mockRejectedValue(repositoryError);

      await expect(useCase.getPaymentStatus("ORDER-001")).rejects.toThrow(
        "Database error"
      );
      expect(mockRepository.findByCode).toHaveBeenCalledWith("ORDER-001");
    });

    it("deve retornar diferentes status de pagamento", async () => {
      const pendingOrder = { ...mockOrder, paymentStatus: "PENDING" };
      const failedOrder = { ...mockOrder, paymentStatus: "FAILED" };

      mockRepository.findByCode.mockResolvedValueOnce(pendingOrder);
      mockRepository.findByCode.mockResolvedValueOnce(failedOrder);

      const pendingResult = await useCase.getPaymentStatus("ORDER-001");
      const failedResult = await useCase.getPaymentStatus("ORDER-002");

      expect(pendingResult).toBe("PENDING");
      expect(failedResult).toBe("FAILED");
      expect(mockRepository.findByCode).toHaveBeenCalledTimes(2);
    });
  });
});
