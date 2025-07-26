import { ProductServiceImpl } from "../../../src/infra/services/product.service";
import { Product } from "../../../src/models/product.model";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
const serviceURL = "http://produtos-service:3002";

describe("ProductServiceImpl", () => {
  let service: ProductServiceImpl;
  const originalEnv = process.env;

  beforeEach(() => {
    service = new ProductServiceImpl();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("findById", () => {
    const mockProduct: Product = {
      id: 1,
      name: "Test Product",
      price: 19.99,
      description: "A test product",
      image: "test.jpg",
      categoryId: 1,
    };

    it("deve retornar produto quando API retorna status 200", async () => {
      const mockResponse = {
        data: { response: mockProduct },
        status: 200,
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.findById(1);

      expect(result.error).toBe(false);
      expect(result.product).toEqual(mockProduct);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${serviceURL}/product/1`);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("deve retornar erro quando API retorna status diferente de 200", async () => {
      const mockResponse = {
        data: { message: "Product not found" },
        status: 404,
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.findById(999);

      expect(result.error).toBe(true);
      expect(result.product).toBeNull();
      expect(mockedAxios.get).toHaveBeenCalledWith(`${serviceURL}/product/999`);
    });

    it("deve propagar erro quando axios falha", async () => {
      const axiosError = new Error("Network error");
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(service.findById(1)).rejects.toThrow("Network error");
      expect(mockedAxios.get).toHaveBeenCalledWith(`${serviceURL}/product/1`);
    });

    it("deve usar a URL base correta", async () => {
      const mockResponse = {
        data: { response: mockProduct },
        status: 200,
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await service.findById(123);

      expect(mockedAxios.get).toHaveBeenCalledWith(`${serviceURL}/product/123`);
    });

    it("deve chamar API com diferentes IDs", async () => {
      const mockResponse = {
        data: { response: mockProduct },
        status: 200,
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await service.findById(1);
      await service.findById(2);
      await service.findById(100);

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        `${serviceURL}/product/1`
      );
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        2,
        `${serviceURL}/product/2`
      );
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        3,
        `${serviceURL}/product/100`
      );
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });
  });
});
