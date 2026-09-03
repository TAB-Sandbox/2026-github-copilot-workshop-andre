<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-orders" class="back-btn" title="Back to list">&#8592;</RouterLink>
        <div>
          <h2>Detail Purchase Order</h2>
          <p class="muted">{{ purchaseOrder?.poNumber || '-' }} &mdash; Purchase Order information detail</p>
        </div>
      </div>
      <div v-if="purchaseOrder" class="btn-group">
        <RouterLink v-if="canReceive" class="btn btn-outline" :to="{ path: '/goods-receipts/new', query: { poId: purchaseOrder.id } }">Receive Goods</RouterLink>
        <button v-if="purchaseOrder.status === 'DRAFT'" class="btn btn-primary" :disabled="isSubmitting" @click="submitPurchaseOrder">
          {{ isSubmitting ? 'Submitting...' : 'Submit PO' }}
        </button>
      </div>
    </div>

    <p v-if="isLoading" class="muted">Loading purchase order...</p>
    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <template v-if="purchaseOrder">
      <div class="card-panel">
        <p class="form-section-title">PO Header</p>
        <div class="form-row">
          <div class="form-group">
            <label for="po-number-detail">PO Number</label>
            <input id="po-number-detail" :value="purchaseOrder.poNumber" disabled />
          </div>
          <div class="form-group">
            <label for="vendor-name-detail">Vendor</label>
            <input id="vendor-name-detail" :value="purchaseOrder.vendorName" disabled />
          </div>
          <div class="form-group">
            <label>Status</label>
            <span class="status-badge" :class="purchaseOrder.status.toLowerCase()">{{ purchaseOrder.status }}</span>
          </div>
        </div>
      </div>

      <div class="card-panel">
        <p class="form-section-title">PO Lines</p>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Line</th>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Ordered QTY</th>
                <th>Received QTY</th>
                <th>Open QTY</th>
                <th>UOM</th>
                <th>Unit Price</th>
                <th>Site</th>
                <th>Required Date</th>
                <th>PR Allocation</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in purchaseOrder.lines" :key="line.id">
                <td>{{ line.lineNo }}</td>
                <td>{{ line.itemCode }}</td>
                <td>{{ line.itemName }}</td>
                <td>{{ line.qtyOrdered }}</td>
                <td>{{ line.qtyReceived }}</td>
                <td>{{ line.qtyOpenForGr }}</td>
                <td>{{ line.uom }}</td>
                <td>{{ formatPrice(line.unitPrice) }}</td>
                <td>{{ line.siteCode }}</td>
                <td>{{ line.requiredDate || '-' }}</td>
                <td>
                  <span v-for="allocation in line.allocations" :key="allocation.prLineId">
                    {{ allocation.prNumber }} ({{ allocation.allocatedQty }})
                  </span>
                  <span v-if="line.allocations.length === 0">-</span>
                </td>
              </tr>
              <tr v-if="purchaseOrder.lines.length === 0">
                <td colspan="11" class="empty-cell">No purchase order lines found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { api } from '../api';

const route = useRoute();
const purchaseOrder = ref(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref('');
const canReceive = computed(() => purchaseOrder.value?.status === 'SUBMITTED' && purchaseOrder.value.lines.some((line) => line.qtyOpenForGr > 0));

function formatPrice(value) {
  return new Intl.NumberFormat('id-ID').format(value);
}

async function load() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    purchaseOrder.value = await api.getPurchaseOrder(route.params.id);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
}

async function submitPurchaseOrder() {
  isSubmitting.value = true;
  errorMessage.value = '';
  try {
    purchaseOrder.value = await api.submitPurchaseOrder(route.params.id);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.form-group input:disabled {
  background: var(--white);
  color: var(--text);
  cursor: default;
  opacity: 1;
}

.table-scroll {
  overflow-x: auto;
}

.table-scroll table {
  min-width: 1100px;
}

.table-scroll th,
.table-scroll td {
  white-space: nowrap;
}

.table-scroll td span {
  display: block;
}

.empty-cell,
.empty-state {
  color: var(--text-muted);
  text-align: center;
  padding: 24px;
}
</style>
