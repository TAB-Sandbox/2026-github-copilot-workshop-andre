import { describe, expect, test } from '@jest/globals';
import { buildApp } from '../src/app.js';

describe('API documentation', () => {
  test('serves the OpenAPI document and Swagger UI at /api-docs', async () => {
    const app = buildApp();

    const documentResponse = await app.inject({
      method: 'GET',
      url: '/api-docs/json',
    });
    const uiResponse = await app.inject({
      method: 'GET',
      url: '/api-docs',
    });

    expect(documentResponse.statusCode).toBe(200);
    expect(documentResponse.json()).toMatchObject({
      openapi: '3.0.3',
      info: { title: 'Procurement MVP API' },
    });
    expect(documentResponse.json().paths['/api/purchase-orders']).toBeDefined();
    expect(uiResponse.statusCode).toBe(200);
    expect(uiResponse.headers['content-type']).toContain('text/html');

    await app.close();
  });
});
