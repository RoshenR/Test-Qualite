import { Order } from '../Order';

export interface CreateOrderRepository {
    save(order: Order): Promise<void>;
}
