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
    snapshot_name: string;
    item_id: number;
  }[];
}
