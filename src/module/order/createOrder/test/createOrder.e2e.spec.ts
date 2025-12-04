import { afterAll, afterEach, beforeAll, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { createTestApp } from '../../../../../tests/create-test-app';
import { stopTestApp } from '../../../../../tests/stop-test-app';
import AppDataSource from '../../../../config/db.config';
import { Order, OrderStatus } from '../../Order';

describe('US-2 : Créer une commande - E2E', () => {
    let app: Express;
    let postgresContainer: PostgreSqlContainer;

    beforeAll(async () => {
        jest.setTimeout(60000);
        const setup = await createTestApp();
        app = setup.app;
        postgresContainer = setup.postgresContainer;
    });

    afterEach(async () => {
        await AppDataSource.getRepository(Order).clear();
    });

    afterAll(async () => {
        await stopTestApp(postgresContainer);
    });

    test('Scénario 1 : création réussie', async () => {
        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1, 2],
                totalPrice: 120
            })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(201);

        const orders = await AppDataSource.getRepository(Order).find();
        expect(orders).toHaveLength(1);
        expect(orders[0].productIds.map(Number)).toEqual([1, 2]);
        expect(orders[0].totalPrice).toBe(120);
        expect(orders[0].status).toBe(OrderStatus.PENDING);
        expect(orders[0].createdAt).toBeInstanceOf(Date);
    });

    test('Scénario 2 : création échouée - trop de produits', async () => {
        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1, 2, 3, 4, 5, 6],
                totalPrice: 200
            })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Une commande doit contenir entre 1 et 5 produits');

        const orders = await AppDataSource.getRepository(Order).find();
        expect(orders).toHaveLength(0);
    });

    test('Scénario 3 : création échouée - prix total hors borne', async () => {
        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1],
                totalPrice: 1
            })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Le prix total doit être compris entre 2€ et 500€');

        const orders = await AppDataSource.getRepository(Order).find();
        expect(orders).toHaveLength(0);
    });

    test('Scénario 4 : création échouée - identifiants invalides', async () => {
        const response = await request(app)
            .post('/api/order')
            .send({
                productIds: [1, 'abc', 3],
                totalPrice: 50
            })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Les identifiants produits doivent être des nombres valides');

        const orders = await AppDataSource.getRepository(Order).find();
        expect(orders).toHaveLength(0);
    });
});