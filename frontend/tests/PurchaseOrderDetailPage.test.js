import { mount } from '@vue/test-utils';
import PurchaseOrderDetailPage from '../src/pages/PurchaseOrderDetailPage.vue';

jest.mock('../src/api', () => ({
  api: {
    getPurchaseOrder: jest.fn(),
    submitPurchaseOrder: jest.fn(),
  },
}));

jest.mock('vue-router', () => ({
  RouterLink: { template: '<a><slot /></a>' },
  useRoute: () => ({ params: { id: 'po-1' } }),
}));

const { api: mockApi } = require('../src/api');

const purchaseOrder = {
  id: 'po-1',
  poNumber: 'PO-2026-0001',
  vendorName: 'Acme Supplies',
  status: 'DRAFT',
  lines: [{
    id: 'po-line-1',
    lineNo: 1,
    itemCode: 'ITEM-001',
    itemName: 'Safety Helmet',
    qtyOrdered: 10,
    qtyReceived: 4,
    qtyOpenForGr: 6,
    uom: 'PCS',
    unitPrice: 150000,
    siteCode: 'JKT',
    requiredDate: '2026-09-10',
    allocations: [{ prLineId: 'pr-line-1', prNumber: 'PR-2026-0001', allocatedQty: 10 }],
  }],
};

describe('PurchaseOrderDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.getPurchaseOrder.mockResolvedValue(purchaseOrder);
  });

  test('renders purchase order details, quantities, and PR allocations', async () => {
    const wrapper = mount(PurchaseOrderDetailPage);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockApi.getPurchaseOrder).toHaveBeenCalledWith('po-1');
    expect(wrapper.text()).toContain('PO-2026-0001');
    expect(wrapper.get('input[disabled]').element.value).toBe('PO-2026-0001');
    expect(wrapper.findAll('input[disabled]')[1].element.value).toBe('Acme Supplies');
    expect(wrapper.text()).toContain('10');
    expect(wrapper.text()).toContain('6');
    expect(wrapper.text()).toContain('PR-2026-0001');
    expect(wrapper.get('button').text()).toContain('Submit PO');
  });

  test('submits a draft purchase order and refreshes the detail', async () => {
    mockApi.submitPurchaseOrder.mockResolvedValue({ ...purchaseOrder, status: 'SUBMITTED' });

    const wrapper = mount(PurchaseOrderDetailPage);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.get('button').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockApi.submitPurchaseOrder).toHaveBeenCalledWith('po-1');
    expect(wrapper.text()).toContain('SUBMITTED');
    expect(wrapper.find('button').exists()).toBe(false);
  });

  test('renders the API error', async () => {
    mockApi.getPurchaseOrder.mockRejectedValue(new Error('Purchase order not found'));

    const wrapper = mount(PurchaseOrderDetailPage);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain('Purchase order not found');
  });
});
