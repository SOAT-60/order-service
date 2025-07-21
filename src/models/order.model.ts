export interface Order {
  id: number;
  orderDate: Date;
  status: string;
  code: string;
  paymentStatus: string;
  items?: {
    id: number;
    quantity: number;
    snapshot_price: number;
    item_id: number;
  }[];
}
