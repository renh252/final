<template>
  <div class="w-full flex flex-col gap-4 border border-gray-300 p-6">
    <base-checkbox
      v-model="disabled"
      label="停用開關"
      class="border rounded p-4"
    />

    <div class="flex flex-1 items-center justify-center">
      <toggle-proactive
        v-model="value"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseCheckbox from '../../base-checkbox.vue'
import ToggleProactive from '../toggle-proactive.vue'

const disabled = ref(false)
const value = ref(false)
</script>
