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
        items: [
          {
            id: 1,
            quantity: 2,
            snapshot_price: 10.5,
            item_id: 1,
            snapshot_name: "Product 1",
          },
          {
            id: 2,
            quantity: 1,
            snapshot_price: 25.0,
            item_id: 2,
            snapshot_name: "Product 2",
          },
        ],
      },
      {
        id: 2,
        orderDate: new Date("2024-01-02"),
        status: "FINALIZADO",
        code: "ORDER-002",
        paymentStatus: "PAID",
        items: [
          {
            id: 3,
            quantity: 1,
            snapshot_price: 15.0,
            item_id: 3,
            snapshot_name: "Product 3",
          },
        ],
      },
      {
        id: 3,
        orderDate: new Date("2024-01-03"),
        status: "PROCESSING",
        code: "ORDER-003",
        paymentStatus: "PENDING",
        items: [
          {
            id: 4,
            quantity: 3,
            snapshot_price: 20.0,
            item_id: 4,
            snapshot_name: "Product 4",
          },
        ],
      },
    ];

    it("deve listar pedidos não finalizados com sucesso e calcular totalPrice", async () => {
      mockRepository.listOrders.mockResolvedValue(mockOrders);

      const result = await useCase.listOrders();

      expect(result).toHaveLength(2);
      expect(result[0].totalPrice).toBe(46.0); // (10.5 * 2) + (25.0 * 1)
      expect(result[1].totalPrice).toBe(60.0); // (20.0 * 3)
      expect(result.every((order) => order.status !== "FINALIZADO")).toBe(true);
      expect(result[0].items?.[0]?.snapshot_name).toBe("Product 1");
      expect(result[1].items?.[0]?.snapshot_name).toBe("Product 4");
    });

    it("deve retornar array vazio quando todos os pedidos estão finalizados", async () => {
      const finalizados: Order[] = [
        {
          id: 1,
          orderDate: new Date("2024-01-01"),
          status: "FINALIZADO",
          code: "ORDER-001",
          paymentStatus: "PAID",
          items: [
            {
              id: 1,
              quantity: 1,
              snapshot_price: 10.0,
              item_id: 1,
              snapshot_name: "Product 1",
            },
          ],
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
