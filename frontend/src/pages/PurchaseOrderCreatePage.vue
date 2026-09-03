<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import PurchaseOrderHeaderForm from '../components/PurchaseOrderHeaderForm.vue';
import PurchaseOrderLineAllocationTable from '../components/PurchaseOrderLineAllocationTable.vue';
import { api } from '../api';

const form = ref({
  vendorName: '',
  neededByDate: '',
  currency: 'IDR',
  paymentTerms: '',
  notes: '',
});

const lines = ref([]);
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref('');

const selectedLines = computed(() => lines.value.filter((line) => line.selected));
const totalValue = computed(() => selectedLines.value.reduce((total, line) => total + (line.qtyOrdered || 0) * line.unitPrice, 0));
const savedMessage = ref('');

function mapOpenLine(prNumber, line) {
  return {
    prLineId: line.id,
    prNumber,
    lineNo: line.lineNo,
    itemCode: line.itemCode,
    itemName: line.itemName,
    uom: line.uom,
    qtyRequested: line.qtyRequested,
    qtyAllocated: line.qtyAllocated,
    qtyRemaining: line.qtyOpenForPo,
    qtyOrdered: line.qtyOpenForPo,
    deliveryAddress: '',
    deliveryDate: line.requiredDate || '',
    unitPrice: line.estUnitPrice,
    siteCode: line.siteCode,
    selected: true,
  };
}

async function loadOpenLines() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const requisitions = await api.listRequisitions();
    const approved = (requisitions.items || []).filter((item) => item.status === 'APPROVED');
    const payloads = await Promise.all(approved.map((item) => api.getRequisitionOpenLines(item.id)));
    lines.value = payloads.flatMap((payload) => payload.openLines.map((line) => mapOpenLine(
      payload.requisition.prNumber,
      line
    )));
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
}

function buildPayload() {
  return {
    vendorName: form.value.vendorName,
    lines: selectedLines.value.map((line) => ({
      prLineId: line.prLineId,
      itemCode: line.itemCode,
      itemName: line.itemName,
      qtyOrdered: line.qtyOrdered,
      unitPrice: line.unitPrice,
      uom: line.uom,
      siteCode: line.siteCode || 'DEFAULT',
      requiredDate: line.deliveryDate || null,
    })),
  };
}

async function savePurchaseOrder(submitAfterCreate = false) {
  savedMessage.value = '';
  errorMessage.value = '';
  if (!form.value.vendorName.trim()) {
    errorMessage.value = 'Vendor is required.';
    return;
  }
  if (selectedLines.value.length === 0) {
    errorMessage.value = 'Select at least one approved PR line.';
    return;
  }

  isSaving.value = true;
  try {
    const purchaseOrder = await api.createPurchaseOrder(buildPayload());
    if (submitAfterCreate) {
      await api.submitPurchaseOrder(purchaseOrder.id);
      savedMessage.value = 'Purchase order submitted.';
    } else {
      savedMessage.value = 'Draft details are ready to save.';
    }
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isSaving.value = false;
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value);
}

onMounted(loadOpenLines);
</script>

<template>
  <section class="po-create-page">
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/" class="back-btn" title="Back to dashboard" aria-label="Back to dashboard">&#8592;</RouterLink>
        <div>
          <h2>Create Purchase Order</h2>
          <p class="muted">Pick approved PR lines and allocate order quantities</p>
        </div>
      </div>
    </div>

    <form @submit.prevent="savePurchaseOrder(false)">
      <PurchaseOrderHeaderForm v-model="form" />
      <p v-if="isLoading" class="muted">Loading approved PR lines...</p>
      <PurchaseOrderLineAllocationTable v-else v-model="lines" @refresh="loadOpenLines" />

      <section class="card-panel totals-panel">
        <div>
          <span>Selected Lines</span>
          <strong>{{ selectedLines.length }}</strong>
        </div>
        <div class="total-value">
          <span>Estimated Total</span>
          <strong>{{ formatPrice(totalValue) }}</strong>
        </div>
      </section>

      <div class="btn-group">
        <button class="btn btn-secondary" type="submit" :disabled="isSaving">Save As Draft</button>
        <button class="btn btn-primary" type="button" :disabled="isSaving" @click="savePurchaseOrder(true)">Submit PO</button>
      </div>
      <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
      <p v-if="savedMessage" class="saved-message" role="status">{{ savedMessage }}</p>
    </form>
  </section>
</template>

<style scoped>
.totals-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.totals-panel div {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.totals-panel span {
  font-size: 13px;
}

.totals-panel strong {
  color: var(--text);
  font-size: 32px;
  font-weight: 400;
  line-height: 1;
}

.total-value {
  align-items: flex-end;
}

.btn-secondary {
  background: var(--secondary);
  color: var(--text);
}

.saved-message {
  color: #2e7d32;
  font-size: 13px;
  text-align: right;
  margin: 12px 0 0;
}

@media (max-width: 900px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .content {
    padding: 24px 16px;
  }

  .page-header {
    gap: 16px;
  }

  .page-header h2 {
    font-size: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .card-panel {
    padding: 16px;
  }

  .totals-panel strong {
    font-size: 26px;
  }
}
</style>
