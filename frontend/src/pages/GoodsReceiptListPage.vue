<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/" class="back-btn" title="Back to dashboard" aria-label="Back to dashboard">&#8592;</RouterLink>
        <div><h2>Goods Receipts</h2><p class="muted">All goods receipt records</p></div>
      </div>
    </div>
    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
    <p v-if="isLoading" class="muted">Loading goods receipts...</p>
    <div v-else class="card-panel">
      <table v-if="items.length">
        <thead><tr><th>GR Number</th><th>Purchase Order</th><th>Receipt Date</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td><RouterLink :to="`/goods-receipts/${item.id}`">{{ item.grNumber }}</RouterLink></td>
            <td>{{ item.purchaseOrder?.poNumber || '-' }}</td>
            <td>{{ formatDate(item.receiptDate) }}</td>
            <td><span class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</span></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-state">No goods receipts found.</p>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '../api';

const items = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value));
}

async function load() {
  try {
    const payload = await api.listGoodsReceipts();
    items.value = payload.items || [];
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.empty-state { color: var(--text-muted); text-align: center; padding: 24px; }
</style>
