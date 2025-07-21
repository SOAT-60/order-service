import { CreateOrderUseCase } from "../../../src/usecases/create-order.usecase";
import { OrderRepository } from "../../../src/repository/order.repository.interface";
import { ProductService } from "../../../src/services/product.service.interface";
import { CreateOrderRequestDTO } from "../../../src/dtos/create-order.dto";
import { Order } from "../../../src/models/order.model";
import { Product } from "../../../src/models/product.model";

describe("CreateOrderUseCase", () => {
  let useCase: CreateOrderUseCase;
  let mockRepository: jest.Mocked<OrderRepository>;
  let mockProductService: jest.Mocked<ProductService>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      listOrders: jest.fn(),
      findOrder: jest.fn(),
      findByCode: jest.fn(),
      updateOrderStatus: jest.fn(),
    };

    mockProductService = {
      findById: jest.fn(),
    };

    useCase = new CreateOrderUseCase(mockRepository, mockProductService);
  });

  describe("createOrder", () => {
    const mockOrderData: CreateOrderRequestDTO = {
      orderDate: "2024-01-01",
      status: "PENDING",
      code: "ORDER-001",
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ],
    };

    const mockProduct1: Product = {
      id: 1,
      name: "Product 1",
      price: 10.5,
      description: "Test product 1",
      image: "image1.jpg",
      categoryId: 1,
    };

    const mockProduct2: Product = {
      id: 2,
      name: "Product 2",
      price: 25.0,
      description: "Test product 2",
      image: "image2.jpg",
      categoryId: 1,
    };

    const mockCreatedOrder: Order = {
      id: 1,
      orderDate: new Date("2024-01-01"),
      status: "PENDING",
      code: "ORDER-001",
      paymentStatus: "PENDING",
      items: [
        { id: 1, quantity: 2, snapshot_price: 10.5, item_id: 1 },
        { id: 2, quantity: 1, snapshot_price: 25.0, item_id: 2 },
      ],
    };

    it("deve criar um pedido com sucesso quando todos os produtos existem", async () => {
      mockProductService.findById.mockResolvedValueOnce({
        error: false,
        product: mockProduct1,
      });
      mockProductService.findById.mockResolvedValueOnce({
        error: false,
        product: mockProduct2,
      });
      mockRepository.create.mockResolvedValue(mockCreatedOrder);

      const result = await useCase.createOrder(mockOrderData);

      expect(result).toBeTruthy();
      expect(result?.order).toEqual(mockCreatedOrder);
      expect(result?.errors).toHaveLength(0);
      expect(mockRepository.create).toHaveBeenCalledWith({
        orderDate: mockOrderData.orderDate,
        status: mockOrderData.status,
        code: mockOrderData.code,
        items: [
          { productId: 1, quantity: 2, price: 10.5 },
          { productId: 2, quantity: 1, price: 25.0 },
        ],
        totalPrice: 46.0, // (10.50 * 2) + (25.00 * 1)
      });
    });

    it("deve retornar erros quando alguns produtos não existem", async () => {
      mockProductService.findById.mockResolvedValueOnce({
        error: false,
        product: mockProduct1,
      });
      mockProductService.findById.mockResolvedValueOnce({
        error: true,
        product: null,
      });
      mockRepository.create.mockResolvedValue(mockCreatedOrder);

      const result = await useCase.createOrder(mockOrderData);

      expect(result).toBeTruthy();
      expect(result?.order).toEqual(mockCreatedOrder);
      expect(result?.errors).toEqual([{ productId: 2 }]);
      expect(mockRepository.create).toHaveBeenCalledWith({
        orderDate: mockOrderData.orderDate,
        status: mockOrderData.status,
        code: mockOrderData.code,
        items: [{ productId: 1, quantity: 2, price: 10.5 }],
        totalPrice: 21.0,
      });
    });

    it("deve calcular o preço total corretamente", async () => {
      const orderWithMultipleQuantities: CreateOrderRequestDTO = {
        ...mockOrderData,
        items: [{ productId: 1, quantity: 5 }],
      };

      mockProductService.findById.mockResolvedValue({
        error: false,
        product: mockProduct1,
      });
      mockRepository.create.mockResolvedValue(mockCreatedOrder);

      await useCase.createOrder(orderWithMultipleQuantities);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalPrice: 52.5,
        })
      );
    });

    it("deve lançar erro quando repository falha", async () => {
      mockProductService.findById.mockResolvedValue({
        error: false,
        product: mockProduct1,
      });
      const repositoryError = new Error("Database error");
      mockRepository.create.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        useCase.createOrder({
          ...mockOrderData,
          items: [{ productId: 1, quantity: 1 }],
        })
      ).rejects.toThrow("Database error");
    });

    it("deve lançar erro quando service falha", async () => {
      const serviceError = new Error("Service error");
      mockProductService.findById.mockRejectedValue(serviceError);

      await expect(
        useCase.createOrder({
          ...mockOrderData,
          items: [{ productId: 1, quantity: 1 }],
        })
      ).rejects.toThrow("Service error");
    });
  });
});
