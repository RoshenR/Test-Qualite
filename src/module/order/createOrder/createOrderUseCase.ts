import { CreateOrderRepository } from './createOrderRepository';
import { Order } from '../Order';

type CreateOrderCommand = {
    productIds: number[];
    totalPrice: number;
};

export class OrderValidationError extends Error {}

export class CreateOrderUseCase {
    private orderRepository: CreateOrderRepository;

    constructor(orderRepository: CreateOrderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(command: CreateOrderCommand): Promise<void> {
        const { productIds, totalPrice } = command;

        this.validateProducts(productIds);
        this.validatePrice(totalPrice);

        const order = new Order(productIds, totalPrice);

        try {
            await this.orderRepository.save(order);
        } catch (error) {
            throw new Error('Erreur lors de la création de la commande');
        }
    }

    private validateProducts(productIds: number[]): void {
        if (!Array.isArray(productIds)) {
            throw new OrderValidationError('Les produits doivent être fournis sous forme de liste');
        }

        if (productIds.length < 1 || productIds.length > 5) {
            throw new OrderValidationError('Une commande doit contenir entre 1 et 5 produits');
        }

        const hasInvalidId = productIds.some(
            productId => typeof productId !== 'number' || Number.isNaN(productId)
        );
        if (hasInvalidId) {
            throw new OrderValidationError(
                'Les identifiants produits doivent être des nombres valides'
            );
        }
    }

    private validatePrice(totalPrice: number): void {
        if (typeof totalPrice !== 'number' || Number.isNaN(totalPrice)) {
            throw new OrderValidationError('Le prix total doit être un nombre');
        }

        if (totalPrice < 2 || totalPrice > 500) {
            throw new OrderValidationError('Le prix total doit être compris entre 2€ et 500€');
        }
    }
}
