import { UpdateStatusOrderUseCase } from "../../../src/usecases/update-status-order.interface";
import { OrderRepository } from "../../../src/repository/order.repository.interface";
import { Order } from "../../../src/models/order.model";

describe("UpdateStatusOrderUseCase", () => {
  let useCase: UpdateStatusOrderUseCase;
  let mockRepository: jest.Mocked<OrderRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      listOrders: jest.fn(),
      findOrder: jest.fn(),
      findByCode: jest.fn(),
      updateOrderStatus: jest.fn(),
    };

    useCase = new UpdateStatusOrderUseCase(mockRepository);
  });

  describe("updateOrderStatus", () => {
    const mockOrder: Order = {
      id: 1,
      orderDate: new Date("2024-01-01"),
      status: "PENDING",
      code: "ORDER-001",
      paymentStatus: "PENDING",
    };

    const updateData = { id: 1, status: "PROCESSING" };

    it("deve atualizar status do pedido com sucesso", async () => {
      mockRepository.findOrder.mockResolvedValue(mockOrder);
      mockRepository.updateOrderStatus.mockResolvedValue(undefined);

      await useCase.updateOrderStatus(updateData);

      expect(mockRepository.findOrder).toHaveBeenCalledWith(updateData.id);
      expect(mockRepository.updateOrderStatus).toHaveBeenCalledWith(
        updateData.id,
        updateData.status
      );
      expect(mockRepository.findOrder).toHaveBeenCalledTimes(1);
      expect(mockRepository.updateOrderStatus).toHaveBeenCalledTimes(1);
    });

    it("deve lançar erro quando pedido não existe", async () => {
      mockRepository.findOrder.mockResolvedValue(null);

      await expect(useCase.updateOrderStatus(updateData)).rejects.toThrow();

      const error = await useCase.updateOrderStatus(updateData).catch((e) => e);
      const parsedError = JSON.parse(error.message);
      expect(parsedError.message).toBe("Pedido não encontrado!");
      expect(parsedError.status).toBe(404);
      expect(mockRepository.findOrder).toHaveBeenCalledWith(updateData.id);
      expect(mockRepository.updateOrderStatus).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando findOrder falha", async () => {
      const repositoryError = new Error("Database find error");
      mockRepository.findOrder.mockRejectedValue(repositoryError);

      await expect(useCase.updateOrderStatus(updateData)).rejects.toThrow(
        "Database find error"
      );
      expect(mockRepository.findOrder).toHaveBeenCalledWith(updateData.id);
      expect(mockRepository.updateOrderStatus).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando updateOrderStatus falha", async () => {
      mockRepository.findOrder.mockResolvedValue(mockOrder);
      const updateError = new Error("Database update error");
      mockRepository.updateOrderStatus.mockRejectedValue(updateError);

      await expect(useCase.updateOrderStatus(updateData)).rejects.toThrow(
        "Database update error"
      );
      expect(mockRepository.findOrder).toHaveBeenCalledWith(updateData.id);
      expect(mockRepository.updateOrderStatus).toHaveBeenCalledWith(
        updateData.id,
        updateData.status
      );
    });

    it("deve atualizar para diferentes status", async () => {
      mockRepository.findOrder.mockResolvedValue(mockOrder);
      mockRepository.updateOrderStatus.mockResolvedValue(undefined);

      const updateData1 = { id: 1, status: "PROCESSING" };
      const updateData2 = { id: 1, status: "COMPLETED" };
      const updateData3 = { id: 1, status: "CANCELLED" };

      await useCase.updateOrderStatus(updateData1);
      await useCase.updateOrderStatus(updateData2);
      await useCase.updateOrderStatus(updateData3);

      expect(mockRepository.updateOrderStatus).toHaveBeenNthCalledWith(
        1,
        1,
        "PROCESSING"
      );
      expect(mockRepository.updateOrderStatus).toHaveBeenNthCalledWith(
        2,
        1,
        "COMPLETED"
      );
      expect(mockRepository.updateOrderStatus).toHaveBeenNthCalledWith(
        3,
        1,
        "CANCELLED"
      );
      expect(mockRepository.updateOrderStatus).toHaveBeenCalledTimes(3);
    });

    it("deve atualizar pedidos com IDs diferentes", async () => {
      const order1 = { ...mockOrder, id: 1 };
      const order2 = { ...mockOrder, id: 2 };

      mockRepository.findOrder.mockResolvedValueOnce(order1);
      mockRepository.findOrder.mockResolvedValueOnce(order2);
      mockRepository.updateOrderStatus.mockResolvedValue(undefined);

      await useCase.updateOrderStatus({ id: 1, status: "PROCESSING" });
      await useCase.updateOrderStatus({ id: 2, status: "COMPLETED" });

      expect(mockRepository.findOrder).toHaveBeenNthCalledWith(1, 1);
      expect(mockRepository.findOrder).toHaveBeenNthCalledWith(2, 2);
      expect(mockRepository.updateOrderStatus).toHaveBeenNthCalledWith(
        1,
        1,
        "PROCESSING"
      );
      expect(mockRepository.updateOrderStatus).toHaveBeenNthCalledWith(
        2,
        2,
        "COMPLETED"
      );
    });
  });
});
