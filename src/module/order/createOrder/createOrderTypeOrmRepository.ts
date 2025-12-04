import AppDataSource from '../../../config/db.config';
import { CreateOrderRepository } from './createOrderRepository';
import { Order } from '../Order';

export class CreateOrderTypeOrmRepository implements CreateOrderRepository {
    async save(order: Order): Promise<void> {
        const typeOrmRepository = AppDataSource.getRepository<Order>(Order);
        await typeOrmRepository.save(order);
    }
}
