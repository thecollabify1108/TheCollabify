const request = require('supertest');
const express = require('express');

// Mock a simple app for health check or import the real app
// To avoid complex DB setup in first test, we'll test the health endpoint
// which we recently updated with Redis status.

describe('Health Check API', () => {
    let app;

    beforeAll(() => {
        // We'll import the real app, but need to handle its async init
        // For a quick integration test without full DB:
        app = require('../../app');
    });

    it('should return 200 OK for /health', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('redis');
    });

    it('should return 200 OK for /api/ping', async () => {
        const res = await request(app).get('/api/ping');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', 'pong');
    });
});
