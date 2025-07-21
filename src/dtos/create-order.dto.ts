export interface CreateOrderRequestDTO {
  orderDate: string;
  status: string;
  code: string;
  items: {
    productId: number;
    quantity: number;
    price?: number;
  }[];
}
