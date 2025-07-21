import { ListOrderUseCase } from "../../../src/usecases/list-order.usecase";
import { OrderRepository } from "../../../src/repository/order.repository.interface";
import { Order } from "../../../src/models/order.model";

describe("ListOrderUseCase", () => {
  let useCase: ListOrderUseCase;
  let mockRepository: jest.Mocked<OrderRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      listOrders: jest.fn(),
      findOrder: jest.fn(),
      findByCode: jest.fn(),
      updateOrderStatus: jest.fn(),
    };

    useCase = new ListOrderUseCase(mockRepository);
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
      {
        id: 2,
        orderDate: new Date("2024-01-02"),
        status: "FINALIZADO",
        code: "ORDER-002",
        paymentStatus: "PAID",
      },
      {
        id: 3,
        orderDate: new Date("2024-01-03"),
        status: "PROCESSING",
        code: "ORDER-003",
        paymentStatus: "PENDING",
      },
    ];

    it("deve listar pedidos não finalizados com sucesso", async () => {
      mockRepository.listOrders.mockResolvedValue(mockOrders);

      const result = await useCase.listOrders();

      expect(result).toHaveLength(2);
      expect(result).toEqual([mockOrders[0], mockOrders[2]]);
      expect(result.every((order) => order.status !== "FINALIZADO")).toBe(true);
    });

    it("deve retornar array vazio quando todos os pedidos estão finalizados", async () => {
      const finalizados: Order[] = [
        {
          id: 1,
          orderDate: new Date("2024-01-01"),
          status: "FINALIZADO",
          code: "ORDER-001",
          paymentStatus: "PAID",
        },
      ];
      mockRepository.listOrders.mockResolvedValue(finalizados);

      const result = await useCase.listOrders();

      expect(result).toHaveLength(0);
    });

    it("deve lançar erro quando repository retorna null", async () => {
      mockRepository.listOrders.mockResolvedValue(null as any);

      await expect(useCase.listOrders()).rejects.toThrow();
      const error = await useCase.listOrders().catch((e) => e);
      const parsedError = JSON.parse(error.message);
      expect(parsedError.message).toBe("Nenhum pedido encontrado!");
      expect(parsedError.status).toBe(404);
    });

    it("deve lançar erro quando repository falha", async () => {
      const repositoryError = new Error("Database connection failed");
      mockRepository.listOrders.mockRejectedValue(repositoryError);

      await expect(useCase.listOrders()).rejects.toThrow(
        "Database connection failed"
      );
    });
  });
});
