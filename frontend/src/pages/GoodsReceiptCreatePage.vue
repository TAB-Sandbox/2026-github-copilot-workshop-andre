<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/goods-receipts" class="back-btn" title="Back to goods receipts" aria-label="Back to goods receipts">&#8592;</RouterLink>
        <div><h2>Create Goods Receipt</h2><p class="muted">Receive open lines from a submitted purchase order</p></div>
      </div>
    </div>
    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
    <p v-if="isLoading" class="muted">Loading open purchase order lines...</p>
    <form v-else-if="purchaseOrder" class="card-panel" @submit.prevent="save">
      <p class="form-section-title">{{ purchaseOrder.poNumber }} · {{ purchaseOrder.status }}</p>
      <div class="form-row">
        <div class="form-group"><label for="receipt-date">Receipt date</label><input id="receipt-date" v-model="form.receiptDate" type="date"></div>
        <div class="form-group full"><label for="receipt-notes">Notes</label><textarea id="receipt-notes" v-model="form.notes"></textarea></div>
      </div>
      <div class="table-scroll">
        <table><thead><tr><th>Receive</th><th>Item</th><th>Open QTY</th><th>Receive QTY</th><th>Actual Site</th></tr></thead>
          <tbody><tr v-for="line in lines" :key="line.id">
            <td><input v-model="line.selected" type="checkbox"></td><td>{{ line.itemCode }} · {{ line.itemName }}</td><td>{{ line.qtyOpenForGr }} {{ line.uom }}</td>
            <td><input v-model.number="line.qtyReceived" type="number" min="0.01" :max="line.qtyOpenForGr" step="0.01" :disabled="!line.selected"></td>
            <td><input v-model="line.actualSiteCode" type="text" :disabled="!line.selected"></td>
          </tr><tr v-if="!lines.length"><td colspan="5" class="empty-state">No open lines available.</td></tr></tbody>
        </table>
      </div>
      <div class="btn-group"><button class="btn btn-primary" :disabled="isSaving || !selectedLines.length">{{ isSaving ? 'Creating...' : 'Create Draft Receipt' }}</button></div>
    </form>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { api } from '../api';

const route = useRoute();
const router = useRouter();
const purchaseOrder = ref(null);
const lines = ref([]);
const form = ref({ receiptDate: new Date().toISOString().slice(0, 10), notes: '' });
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref('');
const selectedLines = computed(() => lines.value.filter((line) => line.selected));

async function load() {
  if (!route.query.poId) { errorMessage.value = 'A purchase order is required.'; isLoading.value = false; return; }
  try {
    const payload = await api.getPurchaseOrderOpenLines(route.query.poId);
    purchaseOrder.value = payload.purchaseOrder;
    lines.value = (payload.openLines || []).map((line) => ({ ...line, selected: true, qtyReceived: line.qtyOpenForGr, actualSiteCode: line.siteCode }));
    if (purchaseOrder.value.status !== 'SUBMITTED') errorMessage.value = 'Only submitted purchase orders can be received.';
  } catch (error) { errorMessage.value = error.message; } finally { isLoading.value = false; }
}

async function save() {
  errorMessage.value = '';
  if (selectedLines.value.some((line) => !line.qtyReceived || line.qtyReceived <= 0 || !line.actualSiteCode.trim())) {
    errorMessage.value = 'Selected lines need a positive quantity and actual site code.';
    return;
  }
  isSaving.value = true;
  try {
    const receipt = await api.createGoodsReceipt({ poId: route.query.poId, receiptDate: form.value.receiptDate || null, notes: form.value.notes || null, lines: selectedLines.value.map((line) => ({ poLineId: line.id, qtyReceived: line.qtyReceived, actualSiteCode: line.actualSiteCode })) });
    await router.push(`/goods-receipts/${receipt.id}`);
  } catch (error) { errorMessage.value = error.message; } finally { isSaving.value = false; }
}

onMounted(load);
</script>

<style scoped>
.table-scroll { overflow-x: auto; }
table { min-width: 760px; }
.empty-state { color: var(--text-muted); text-align: center; padding: 24px; }
.form-group input:disabled { background: var(--table-header); }
</style>
