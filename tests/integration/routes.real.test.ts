jest.mock("reflect-metadata");

jest.mock("inversify", () => ({
  Container: jest.fn().mockImplementation(() => ({
    bind: jest.fn().mockReturnThis(),
    to: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnValue({}),
  })),
  inject: jest.fn(
    () => (target: any, propertyKey: string, parameterIndex: number) => {}
  ),
  injectable: jest.fn(() => (constructor: Function) => {}),
}));

jest.mock("../../src/infra/typeORM/config", () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    }),
    initialize: jest.fn().mockResolvedValue(undefined),
    isInitialized: true,
  },
}));

jest.mock("../../src/infra/services/product.service", () => ({
  ProductServiceImpl: jest.fn().mockImplementation(() => ({
    findById: jest.fn().mockResolvedValue({
      error: false,
      product: { id: 1, name: "Produto Teste", price: 10.0 },
    }),
  })),
}));

jest.mock("../../src/infra/typeORM/repository/order.repository", () => ({
  OrderRepositoryImpl: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    listOrders: jest.fn(),
    findOrder: jest.fn(),
    findByCode: jest.fn(),
    updateOrderStatus: jest.fn(),
  })),
}));

jest.mock("../../src/usecases/create-order.usecase", () => ({
  CreateOrderUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}));

jest.mock("../../src/usecases/list-order.usecase", () => ({
  ListOrderUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}));

jest.mock("../../src/usecases/get-payment-status-order.usecase", () => ({
  GetPaymentStatusOrderUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}));

jest.mock("../../src/usecases/update-status-order.interface", () => ({
  UpdateStatusOrderUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}));

const mockController = {
  createOrder: jest.fn(),
  listOrders: jest.fn(),
  getPaymentStatus: jest.fn(),
  updateStatus: jest.fn(),
};

const mockContainer = {
  get: jest.fn().mockImplementation((token: string) => {
    if (token === "OrderController") {
      return mockController;
    }
    return mockController;
  }),
  bind: jest.fn().mockReturnThis(),
  to: jest.fn().mockReturnThis(),
};

jest.mock("../../src/infra/DI/container", () => ({
  container: mockContainer,
}));

jest.mock("../../src/controller", () => ({
  OrderController: jest.fn().mockImplementation(() => mockController),
}));

jest.mock("cors", () =>
  jest.fn(() => (req: any, res: any, next: any) => next())
);

const mockRoutes: {
  [key: string]: { method: string; path: string; handler: Function };
} = {};

const mockRouter = {
  use: jest.fn(),
  get: jest.fn((path: string, handler: Function) => {
    mockRoutes[`GET${path}`] = { method: "GET", path, handler };
  }),
  post: jest.fn((path: string, handler: Function) => {
    mockRoutes[`POST${path}`] = { method: "POST", path, handler };
  }),
  put: jest.fn((path: string, handler: Function) => {
    mockRoutes[`PUT${path}`] = { method: "PUT", path, handler };
  }),
  delete: jest.fn((path: string, handler: Function) => {
    mockRoutes[`DELETE${path}`] = { method: "DELETE", path, handler };
  }),
};

jest.mock("express", () => ({
  Router: jest.fn().mockImplementation(() => mockRouter),
  json: jest.fn(),
  urlencoded: jest.fn(),
}));

describe("Routes Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    require("../../src/routes");
  });

  describe("GET /health", () => {
    it("deve retornar health check", async () => {
      const handler = mockRoutes["GET/health"].handler;

      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "ok",
        timestamp: expect.any(String),
      });
    });
  });

  describe("POST /order/create", () => {
    it("deve criar pedido com sucesso", async () => {
      const handler = mockRoutes["POST/order/create"].handler;

      const mockResult = {
        order: { id: 1, code: "ORDER-001" },
        errors: [],
      };
      mockController.createOrder.mockResolvedValue(mockResult);

      const mockReq = {
        body: {
          orderDate: "2024-01-01",
          status: "PENDING",
          code: "ORDER-001",
          items: [],
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await handler(mockReq, mockRes);

      expect(mockController.createOrder).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Pedido criado com sucesso",
        response: { orders: mockResult.order, errorItems: mockResult.errors },
      });
    });

    it("deve retornar erro 500 quando controller retorna null", async () => {
      const handler = mockRoutes["POST/order/create"].handler;

      mockController.createOrder.mockResolvedValue(null);

      const mockReq = {
        body: {
          orderDate: "2024-01-01",
          status: "PENDING",
          code: "ORDER-001",
          items: [],
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Erro ao criar" });
    });

    it("deve tratar erro com JSON parseável", async () => {
      const handler = mockRoutes["POST/order/create"].handler;

      const error = new Error(
        JSON.stringify({ message: "Erro específico", status: 400 })
      );
      mockController.createOrder.mockRejectedValue(error);

      const mockReq = {
        body: {
          orderDate: "2024-01-01",
          status: "PENDING",
          code: "ORDER-001",
          items: [],
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Erro específico" });
    });

    it("deve retornar erro genérico", async () => {
      const handler = mockRoutes["POST/order/create"].handler;

      const error = new Error("Erro genérico");
      mockController.createOrder.mockRejectedValue(error);

      const mockReq = {
        body: {
          orderDate: "2024-01-01",
          status: "PENDING",
          code: "ORDER-001",
          items: [],
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Erro ao criar pedido",
      });
    });
  });

  describe("GET /order/list", () => {
    it("deve listar pedidos", async () => {
      const handler = mockRoutes["GET/order/list"].handler;

      const mockOrders = [{ id: 1, code: "ORDER-001" }];
      mockController.listOrders.mockResolvedValue(mockOrders);

      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "produtos listados com sucesso!",
        response: mockOrders,
      });
    });

    it("deve tratar erro JSON parseável", async () => {
      const handler = mockRoutes["GET/order/list"].handler;

      const error = new Error(
        JSON.stringify({ message: "Nenhum pedido", status: 404 })
      );
      mockController.listOrders.mockRejectedValue(error);

      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Nenhum pedido" });
    });

    it("deve tratar erro genérico", async () => {
      const handler = mockRoutes["GET/order/list"].handler;

      const error = new Error("Erro genérico");
      mockController.listOrders.mockRejectedValue(error);

      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Erro ao listar pedido",
      });
    });
  });

  describe("GET /order/get-payment-status/:code", () => {
    it("deve buscar status de pagamento", async () => {
      const handler = mockRoutes["GET/order/get-payment-status/:code"].handler;

      mockController.getPaymentStatus.mockResolvedValue("PAID");

      const mockReq = {
        params: { code: "ORDER-001" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Status recuperado com sucesso",
        response: { status: "PAID" },
      });
    });

    it("deve tratar erro JSON parseável", async () => {
      const handler = mockRoutes["GET/order/get-payment-status/:code"].handler;

      const error = new Error(
        JSON.stringify({ message: "Pedido não encontrado", status: 404 })
      );
      mockController.getPaymentStatus.mockRejectedValue(error);

      const mockReq = {
        params: { code: "ORDER-001" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Pedido não encontrado",
      });
    });

    it("deve tratar erro genérico", async () => {
      const handler = mockRoutes["GET/order/get-payment-status/:code"].handler;

      const error = new Error("Erro genérico");
      mockController.getPaymentStatus.mockRejectedValue(error);

      const mockReq = {
        params: { code: "ORDER-001" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Erro ao encontrar pedido",
      });
    });
  });
});
