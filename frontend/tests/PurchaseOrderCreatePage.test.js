import { mount } from '@vue/test-utils';
import PurchaseOrderCreatePage from '../src/pages/PurchaseOrderCreatePage.vue';
import PurchaseOrderHeaderForm from '../src/components/PurchaseOrderHeaderForm.vue';
import PurchaseOrderLineAllocationTable from '../src/components/PurchaseOrderLineAllocationTable.vue';

jest.mock('../src/api', () => ({
  api: {
    listRequisitions: jest.fn(),
    getRequisitionOpenLines: jest.fn(),
    createPurchaseOrder: jest.fn(),
    submitPurchaseOrder: jest.fn(),
  },
}));

const { api: mockApi } = require('../src/api');

describe('PurchaseOrderHeaderForm', () => {
  test('renders a required vendor field', () => {
    const wrapper = mount(PurchaseOrderHeaderForm, {
      props: {
        modelValue: {
          vendorName: '',
          neededByDate: '',
          currency: 'IDR',
          paymentTerms: '',
          notes: '',
        },
      },
    });

    const vendorInput = wrapper.get('#vendor-name');

    expect(vendorInput.attributes('required')).toBeDefined();
    expect(vendorInput.attributes('placeholder')).toBe('Type...');
  });

  test('marks vendor as invalid until a vendor is entered', async () => {
    const wrapper = mount(PurchaseOrderHeaderForm, {
      props: {
        modelValue: { vendorName: '', neededByDate: '', currency: 'IDR', paymentTerms: '', notes: '' },
      },
    });

    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.get('#vendor-name').attributes('required')).toBeDefined();

    await wrapper.get('#vendor-name').setValue('PT Maju');
    expect(wrapper.get('#vendor-name').element.value).toBe('PT Maju');
    expect(wrapper.emitted('update:modelValue')[0][0]).toMatchObject({ vendorName: 'PT Maju' });
  });
});

describe('PurchaseOrderLineAllocationTable', () => {
  test('renders line details and disables quantity for unselected lines', () => {
    const wrapper = mount(PurchaseOrderLineAllocationTable, {
      props: {
        modelValue: [
          {
            prLineId: 'line-1',
            prNumber: 'PR-001',
            lineNo: 1,
            itemCode: 'ITEM-1',
            itemName: 'Safety Helmet',
            qtyRequested: 10,
            qtyAllocated: 0,
            qtyRemaining: 10,
            qtyOrdered: 10,
            uom: 'PCS',
            unitPrice: 150000,
            deliveryAddress: '',
            deliveryDate: '',
            selected: true,
          },
          {
            prLineId: 'line-2',
            prNumber: 'PR-001',
            lineNo: 2,
            itemCode: 'ITEM-2',
            itemName: 'Safety Vest',
            qtyRequested: 5,
            qtyAllocated: 0,
            qtyRemaining: 5,
            qtyOrdered: 5,
            uom: 'PCS',
            unitPrice: 85000,
            deliveryAddress: '',
            deliveryDate: '',
            selected: false,
          },
        ],
      },
    });

    expect(wrapper.text()).toContain('Safety Helmet');
    expect(wrapper.text()).toContain('Safety Vest');
    expect(wrapper.text()).toContain('1 selected');
    expect(wrapper.find('[aria-label="Order quantity for Safety Helmet"]').attributes('disabled')).toBeUndefined();
    expect(wrapper.find('[aria-label="Order quantity for Safety Vest"]').attributes('disabled')).toBeDefined();
    expect(wrapper.find('[aria-label="Order quantity for Safety Helmet"]').attributes('max')).toBe('10');
  });

  test('renders editable delivery fields for selected lines', () => {
    const wrapper = mount(PurchaseOrderLineAllocationTable, {
      props: {
        modelValue: [{
          prLineId: 'line-1', prNumber: 'PR-001', lineNo: 1, itemCode: 'ITEM-1', itemName: 'Safety Helmet',
          qtyRequested: 10, qtyAllocated: 2, qtyRemaining: 8, qtyOrdered: 4, uom: 'PCS',
          unitPrice: 150000, deliveryAddress: '', deliveryDate: '', selected: true,
        }],
      },
    });

    expect(wrapper.get('[aria-label="Delivery address for Safety Helmet"]').attributes('placeholder')).toBe('Type...');
    expect(wrapper.get('[aria-label="Unit price for Safety Helmet"]').element.value).toBe('150000');
    expect(wrapper.text()).toContain('600.000');
  });
});

describe('PurchaseOrderCreatePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.listRequisitions.mockResolvedValue({ items: [{ id: 'approved-pr', status: 'APPROVED' }] });
    mockApi.getRequisitionOpenLines.mockResolvedValue({
      requisition: { id: 'approved-pr', prNumber: 'PR-001', status: 'APPROVED' },
      openLines: [{
        id: 'pr-line-001', lineNo: 1, itemCode: 'ITEM-001', itemName: 'Safety Helmet',
        qtyRequested: 10, qtyAllocated: 2, qtyOpenForPo: 8, uom: 'PCS', estUnitPrice: 150000,
        siteCode: 'JKT', requiredDate: null,
      }],
    });
  });

  test('loads open lines from approved requisitions', async () => {
    mockApi.listRequisitions.mockResolvedValue({
      items: [
        { id: 'approved-pr', status: 'APPROVED' },
        { id: 'draft-pr', status: 'DRAFT' },
      ],
    });
    mockApi.getRequisitionOpenLines.mockResolvedValue({
      requisition: { id: 'approved-pr', prNumber: 'PR-001', status: 'APPROVED' },
      openLines: [{
        id: 'pr-line-001',
        lineNo: 1,
        itemCode: 'ITEM-001',
        itemName: 'Safety Helmet',
        qtyRequested: 10,
        qtyAllocated: 2,
        qtyOpenForPo: 8,
        uom: 'PCS',
        estUnitPrice: 150000,
        siteCode: 'JKT',
        requiredDate: null,
      }],
    });

    const wrapper = mount(PurchaseOrderCreatePage, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    });
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockApi.getRequisitionOpenLines).toHaveBeenCalledWith('approved-pr');
    expect(wrapper.text()).toContain('Safety Helmet');
    expect(wrapper.text()).not.toContain('No approved PR lines are available.');
  });

  test('creates a draft PO and reports feedback', async () => {
    mockApi.createPurchaseOrder.mockResolvedValue({ id: 'po-1', status: 'DRAFT' });

    const wrapper = mount(PurchaseOrderCreatePage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    expect(wrapper.text()).toContain('Create Purchase Order');

    await wrapper.get('#vendor-name').setValue('Acme Supplies');
    await wrapper.vm.$nextTick();
    await wrapper.get('form').trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockApi.createPurchaseOrder).toHaveBeenCalledWith(expect.objectContaining({
      vendorName: 'Acme Supplies',
      lines: expect.any(Array),
    }));
    expect(wrapper.text()).toContain('Draft details are ready to save.');
  });

  test('creates then submits when Submit PO is selected', async () => {
    mockApi.createPurchaseOrder.mockResolvedValue({ id: 'po-1', status: 'DRAFT' });
    mockApi.submitPurchaseOrder.mockResolvedValue({ id: 'po-1', status: 'SUBMITTED' });

    const wrapper = mount(PurchaseOrderCreatePage, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    });
    await wrapper.get('#vendor-name').setValue('Acme Supplies');
    await wrapper.vm.$nextTick();
    await wrapper.get('button.btn-primary').trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockApi.submitPurchaseOrder).toHaveBeenCalledWith('po-1');
    expect(wrapper.text()).toContain('Purchase order submitted.');
  });

  test('shows API validation errors', async () => {
    mockApi.createPurchaseOrder.mockRejectedValue(new Error('allocation qty 12 exceeds remaining 10'));

    const wrapper = mount(PurchaseOrderCreatePage, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    });
    await wrapper.get('#vendor-name').setValue('Acme Supplies');
    await wrapper.vm.$nextTick();
    await wrapper.get('form').trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain('allocation qty 12 exceeds remaining 10');
  });
});
