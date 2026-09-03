<template>
  <section class="card-panel po-header-form">
    <h3 class="form-section-title">PO Header</h3>
    <div class="form-row">
      <div class="form-group">
        <label for="vendor-name">Vendor</label>
        <input id="vendor-name" :value="modelValue.vendorName" placeholder="Type..." required @input="updateField('vendorName', $event.target.value)" />
      </div>
      <div class="form-group">
        <label for="needed-by-date">Needed By date</label>
        <input id="needed-by-date" :value="modelValue.neededByDate" type="date" @input="updateField('neededByDate', $event.target.value)" />
      </div>
      <div class="form-group">
        <label for="currency">Currency</label>
        <select id="currency" :value="modelValue.currency" @change="updateField('currency', $event.target.value)">
          <option value="IDR">IDR...</option>
          <option value="USD">USD...</option>
        </select>
      </div>
      <div class="form-group">
        <label for="payment-terms">Payment Terms</label>
        <input id="payment-terms" :value="modelValue.paymentTerms" placeholder="Type..." @input="updateField('paymentTerms', $event.target.value)" />
      </div>
    </div>
    <div class="form-group full notes-field">
      <label for="po-notes">Notes</label>
      <textarea
        id="po-notes"
        :value="modelValue.notes"
        placeholder="Type..."
        rows="3"
        @input="updateField('notes', $event.target.value)"
      />
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

function updateField(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value });
}
</script>

