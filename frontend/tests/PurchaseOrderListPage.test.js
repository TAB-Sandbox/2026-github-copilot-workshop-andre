import { mount } from '@vue/test-utils';
import PurchaseOrderListPage from '../src/pages/PurchaseOrderListPage.vue';

jest.mock('../src/api', () => ({
  api: {
    listPurchaseOrders: jest.fn(),
  },
}));

const { api: mockApi } = require('../src/api');

const routerStubs = {
  RouterLink: { template: '<a :href="to"><slot /></a>', props: ['to'] },
};

describe('PurchaseOrderListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders purchase orders and links each order to its detail page', async () => {
    mockApi.listPurchaseOrders.mockResolvedValue({
      items: [{
        id: 'po-1',
        poNumber: 'PO-2026-0001',
        vendorName: 'Acme Supplies',
        status: 'DRAFT',
        createdAt: '2026-09-03T10:00:00.000Z',
      }],
    });

    const wrapper = mount(PurchaseOrderListPage, { global: { stubs: routerStubs } });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain('PO-2026-0001');
    expect(wrapper.text()).toContain('Acme Supplies');
    expect(wrapper.text()).toContain('DRAFT');
    expect(wrapper.get('a[href="/purchase-orders/po-1"]').exists()).toBe(true);
    expect(wrapper.get('a[href="/purchase-orders/new"]').exists()).toBe(true);
  });

  test('renders an empty state when there are no purchase orders', async () => {
    mockApi.listPurchaseOrders.mockResolvedValue({ items: [] });

    const wrapper = mount(PurchaseOrderListPage, { global: { stubs: routerStubs } });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain('No purchase orders found.');
  });

  test('renders the API error', async () => {
    mockApi.listPurchaseOrders.mockRejectedValue(new Error('Service unavailable'));

    const wrapper = mount(PurchaseOrderListPage, { global: { stubs: routerStubs } });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain('Service unavailable');
  });
});
