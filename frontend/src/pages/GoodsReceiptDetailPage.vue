<template>
  <section>
    <div class="page-header"><div class="page-header-left"><RouterLink to="/goods-receipts" class="back-btn" title="Back to goods receipts" aria-label="Back to goods receipts">&#8592;</RouterLink><div><h2>Goods Receipt Detail</h2><p class="muted">{{ receipt?.grNumber || '-' }}</p></div></div><button v-if="receipt?.status === 'DRAFT'" class="btn btn-primary" :disabled="isPosting" @click="post">{{ isPosting ? 'Posting...' : 'Post Receipt' }}</button></div>
    <p v-if="isLoading" class="muted">Loading goods receipt...</p><p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
    <template v-if="receipt">
      <div class="card-panel"><p class="form-section-title">Receipt Header</p><div class="form-row"><div class="form-group"><label>GR Number</label><input :value="receipt.grNumber" disabled></div><div class="form-group"><label>Purchase Order</label><RouterLink :to="`/purchase-orders/${receipt.purchaseOrder.id}`">{{ receipt.purchaseOrder.poNumber }}</RouterLink></div><div class="form-group"><label>Receipt Date</label><input :value="receipt.receiptDate || '-'" disabled></div><div class="form-group"><label>Status</label><span class="status-badge" :class="receipt.status.toLowerCase()">{{ receipt.status }}</span></div></div><p v-if="receipt.notes" class="muted">{{ receipt.notes }}</p></div>
      <div class="card-panel"><p class="form-section-title">Receipt Lines</p><div class="table-scroll"><table><thead><tr><th>Line</th><th>Item</th><th>Received QTY</th><th>PO Open QTY</th><th>UOM</th><th>Actual Site</th></tr></thead><tbody><tr v-for="line in receipt.lines" :key="line.id"><td>{{ line.lineNo }}</td><td>{{ line.itemCode }} · {{ line.itemName }}</td><td>{{ line.qtyReceived }}</td><td>{{ line.qtyOpenForGr }}</td><td>{{ line.uom }}</td><td>{{ line.actualSiteCode }}</td></tr></tbody></table></div></div>
    </template>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { api } from '../api';

const route = useRoute();
const receipt = ref(null);
const isLoading = ref(true);
const isPosting = ref(false);
const errorMessage = ref('');

async function load() { try { receipt.value = await api.getGoodsReceipt(route.params.id); } catch (error) { errorMessage.value = error.message; } finally { isLoading.value = false; } }
async function post() { isPosting.value = true; errorMessage.value = ''; try { receipt.value = await api.postGoodsReceipt(route.params.id); } catch (error) { errorMessage.value = error.message; } finally { isPosting.value = false; } }
onMounted(load);
</script>

<style scoped>
.form-group input:disabled { background: var(--white); color: var(--text); cursor: default; opacity: 1; }
.table-scroll { overflow-x: auto; }
table { min-width: 760px; }
</style>
