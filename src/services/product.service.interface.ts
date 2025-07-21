import { Product } from "../models/product.model";

export interface ProductService {
  findById(
    productId: number
  ): Promise<{ error: boolean; product: Product | null }>;
}
