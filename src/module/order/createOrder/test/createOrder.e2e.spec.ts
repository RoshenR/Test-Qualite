import { describe, expect, test, beforeAll, afterAll, jest } from '@jest/globals';
import { Order, OrderStatus } from '../../Order';
import { Product } from '../../../product/Product';
import { buildApp } from '../../../../config/app';
import request from 'supertest';
import { Express } from 'express';

describe('US-2 : Créer une commande - E2E', () => {
    const persistedOrders: Order[] = [];
    let app: Express;

    beforeAll(async () => {
        const AppDataSource = require('../../../../config/db.config').default;

        jest.spyOn(AppDataSource, 'getRepository').mockImplementation(entity => {
            if (entity === Order) {
                return {
                    clear: async () => {
                        persistedOrders.length = 0;
                    },
                    find: async () => [...persistedOrders],
                    save: async (order: Order) => {
                        if (!order.id) {
                            order.id = persistedOrders.length + 1;
                        }
                        persistedOrders.push(order);
                        return order;
                    }
                } as any;
            }

            throw new Error('Unknown entity');
        });

        app = buildApp();
    });

    afterAll(async () => {
        jest.restoreAllMocks();
        persistedOrders.length = 0;
    });

    test('Scénario 1 : création réussie', async () => {
        // Étant donné qu'il n'y a pas de commande enregistrée
        persistedOrders.length = 0;

        // Quand je créé une commande avec 2 produits et un prix total à 120
        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1, 2],
                totalPrice: 120
            })
            .set('Content-Type', 'application/json');

        // Alors la commande doit être créée avec un statut «PENDING» et une date de création
        expect(response.status).toBe(201);
        const orders = [...persistedOrders];
        expect(orders).toHaveLength(1);
        expect(orders[0].productIds.map(Number)).toEqual([1, 2]);
        expect(orders[0].totalPrice).toBe(120);
        expect(orders[0].status).toBe(OrderStatus.PENDING);
        expect(orders[0].createdAt).toBeInstanceOf(Date);
    });

    test('Scénario 2 : création échouée - trop de produits', async () => {
        // Étant donné qu'il n'y a pas de commande enregistrée
        persistedOrders.length = 0;

        // Quand je créé une commande avec 6 produits
        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1, 2, 3, 4, 5, 6],
                totalPrice: 200
            })
            .set('Content-Type', 'application/json');

        // Alors une erreur doit être envoyée «Une commande doit contenir entre 1 et 5 produits»
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Une commande doit contenir entre 1 et 5 produits');

        const orders = [...persistedOrders];
        expect(orders).toHaveLength(0);
    });

    test('Scénario 3 : création échouée - prix total hors borne', async () => {
        // Étant donné qu'il n'y a pas de commande enregistrée
        persistedOrders.length = 0;

        // Quand je créé une commande avec un prix total égal à 1
        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1],
                totalPrice: 1
            })
            .set('Content-Type', 'application/json');

        // Alors une erreur doit être envoyée «Le prix total doit être compris entre 2€ et 500€»
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Le prix total doit être compris entre 2€ et 500€');

        const orders = [...persistedOrders];
        expect(orders).toHaveLength(0);
    });

    test('Scénario 4 : création échouée - identifiants invalides', async () => {
        // Étant donné qu'il n'y a pas de commande enregistrée
        persistedOrders.length = 0;

        // Quand je créé une commande avec un identifiant produit non numérique
        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1, 'abc', 3],
                totalPrice: 50
            })
            .set('Content-Type', 'application/json');

        // Alors une erreur doit être envoyée «Les identifiants produits doivent être des nombres valides»
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Les identifiants produits doivent être des nombres valides');

        const orders = [...persistedOrders];
        expect(orders).toHaveLength(0);
    });
});