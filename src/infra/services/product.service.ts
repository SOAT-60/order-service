import { inject, injectable } from "inversify";
import { ProductService } from "../../services/product.service.interface";
import { Product } from "../../models/product.model";
import axios from "axios";

@injectable()
export class ProductServiceImpl implements ProductService {
  private readonly basURL: string;

  constructor() {
    this.basURL = "http://produtos-service:3002";
  }

  async findById(
    productId: number
  ): Promise<{ error: boolean; product: Product | null }> {
    const { data, status } = await axios.get<{ response: Product }>(
      `${this.basURL}/product/${productId}`
    );

    if (status === 200) {
      return { error: false, product: data.response };
    }

    return { error: true, product: null };
  }
}
