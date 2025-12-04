import { describe, expect, test } from '@jest/globals';
import { CreateOrderUseCase } from '../createOrderUseCase';
import { CreateOrderRepository } from '../createOrderRepository';
import { Order } from '../../Order';

class CreateOrderDummyRepository implements CreateOrderRepository {
    async save(order: Order): Promise<void> {
        // Référentiel factice : ne fait rien
        return Promise.resolve();
    }
}

describe('US-2 : Créer une commande', () => {
    test('Scénario : échec si plus de 5 produits', async () => {
        // Étant donné qu'il n'y a pas de commande enregistrée
        const orderRepository = new CreateOrderDummyRepository();
        const createOrderUseCase = new CreateOrderUseCase(orderRepository);

        await expect(
            // Quand j'essaie de créer une commande avec 6 produits
            createOrderUseCase.execute({ productIds: [1, 2, 3, 4, 5, 6], totalPrice: 120 })
            // Alors une erreur doit être envoyée "Une commande doit contenir entre 1 et 5 produits"
        ).rejects.toThrow('Une commande doit contenir entre 1 et 5 produits');
    });
});