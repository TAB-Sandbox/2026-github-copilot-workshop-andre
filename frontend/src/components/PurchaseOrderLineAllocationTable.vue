<template>
  <section class="card-panel allocation-panel">
    <div class="card-panel-header">
      <div>
        <h3 class="form-section-title">Approved PR Lines</h3>
      </div>
      <button type="button" class="refresh-btn" @click="$emit('refresh')">Refresh Open Lines</button>
    </div>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Select</th><th>PR No</th><th>PR Line</th><th>Item Code</th><th>Item Name</th><th>UOM</th>
            <th>Requested QTY</th><th>Allocated QTY</th><th>Remaining QTY</th><th>Order QTY</th>
            <th>Delivery Address</th><th>Delivery Date</th><th>Unit Price</th><th>Line Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in modelValue" :key="line.prLineId">
            <td>
              <input
                :id="`line-${line.prLineId}`"
                :checked="line.selected"
                type="checkbox"
                :aria-label="`Select ${line.itemName}`"
                @change="updateLine(line.prLineId, { selected: $event.target.checked })"
              />
            </td>
            <td><label :for="`line-${line.prLineId}`">{{ line.prNumber }}</label></td>
            <td>{{ line.lineNo }}</td><td>{{ line.itemCode }}</td><td>{{ line.itemName }}</td><td>{{ line.uom }}</td>
            <td>{{ line.qtyRequested }}</td><td>{{ line.qtyAllocated }}</td><td>{{ line.qtyRemaining }}</td>
            <td><input :value="line.qtyOrdered" type="number" min="0" :max="line.qtyRemaining" step="1" :disabled="!line.selected" :aria-label="`Order quantity for ${line.itemName}`" @input="updateLine(line.prLineId, { qtyOrdered: Number($event.target.value) })" /></td>
            <td><input :value="line.deliveryAddress" placeholder="Type..." :aria-label="`Delivery address for ${line.itemName}`" @input="updateLine(line.prLineId, { deliveryAddress: $event.target.value })" /></td>
            <td><input :value="line.deliveryDate" type="date" aria-label="Delivery date" @input="updateLine(line.prLineId, { deliveryDate: $event.target.value })" /></td>
            <td><input :value="line.unitPrice" type="number" min="0" step="1" :aria-label="`Unit price for ${line.itemName}`" @input="updateLine(line.prLineId, { unitPrice: Number($event.target.value) })" /></td>
            <td>{{ formatPrice(line.qtyOrdered * line.unitPrice) }}</td>
          </tr>
          <tr v-if="modelValue.length === 0">
            <td colspan="14" class="empty-cell">No approved PR lines are available.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <span class="selection-count">{{ selectedCount }} selected</span>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'refresh']);
const selectedCount = computed(() => props.modelValue.filter((line) => line.selected).length);

function updateLine(prLineId, changes) {
  emit('update:modelValue', props.modelValue.map((line) => (
    line.prLineId === prLineId ? { ...line, ...changes } : line
  )));
}

function formatPrice(value) {
  return new Intl.NumberFormat('id-ID').format(value);
}
</script>

<style scoped>
.form-section-title {
  margin: 0;
}

.refresh-btn {
  background: var(--white);
  border: 1px solid var(--primary);
  border-radius: var(--radius-btn);
  color: var(--text);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  padding: 10px 24px;
}

.table-scroll {
  overflow-x: auto;
}

.allocation-panel table {
  min-width: 1240px;
}

.allocation-panel th,
.allocation-panel td {
  white-space: nowrap;
}

.allocation-panel table input {
  width: 100%;
  min-width: 84px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font: inherit;
}

.card-panel table input:focus {
  border-color: var(--primary);
  outline: none;
}

.card-panel table input:disabled {
  background: var(--table-header);
  cursor: not-allowed;
}

.selection-count {
  display: block;
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 12px;
}

.empty-cell {
  color: var(--text-muted);
  text-align: center;
  padding: 24px;
}
</style>
