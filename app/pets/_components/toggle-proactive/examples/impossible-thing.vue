<template>
  <div class="w-full flex-center border border-gray-300 p-10">
    <div class="flex flex-col gap-4">
      <label
        v-for="state in stateList"
        :key="state.label"
        class="flex cursor-pointer items-center justify-end gap-5"
      >
        <div class="text-2xl">
          {{ state.label }}
        </div>

        <toggle-proactive
          ref="toggleRefList"
          v-model="state.value"
          v-bind="colorData"
          size="3.5rem"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCycleList } from '@vueuse/core'
import { pipe, reduce, sample } from 'remeda'
import { computed, ref, watch } from 'vue'
import ToggleProactive from '../toggle-proactive.vue'

interface State {
  value: boolean;
  label: string;
}

type Toggle = InstanceType<typeof ToggleProactive>

const toggleRefList = ref<Toggle[]>()

const {
  state: colorData,
  next: nextColor,
} = useCycleList([
  {
    furColor: '#7DDAEA',
    padColor: '#000',
  },
  {
    furColor: '#FAFAFA',
    padColor: '#FFA5A5',
  },
  {
    furColor: '#DFC57B',
    padColor: '#000',
  },
  {
    furColor: '#8D6F64',
    padColor: '#FFA5A5',
  },
  {
    furColor: '#444',
    padColor: '#FFA5A5',
  },
  {
    furColor: '#F3F2F2',
    padColor: '#000',
  },
])

const stateList = ref<State[]>([
  {
    label: '要快',
    value: false,
  },
  {
    label: '要好',
    value: false,
  },
  {
    label: '要便宜',
    value: false,
  },
])
const booleanList = computed(
  () => stateList.value.map((state) => state.value),
)

watch(booleanList, (value, oldValue) => {
  const allTrue = value.every((v) => v)
  if (!allTrue) {
    return
  }

  const targetIndex = pipe(
    oldValue,
    /** 排除最後一個切換的開關 */
    reduce(
      (acc: number[], boolValue, i) => boolValue ? [...acc, i] : acc,
      [],
    ),
    sample(1),
    ([i]) => i ?? 0,
  )

  nextColor()

  toggleRefList.value?.[targetIndex]?.toggle()
})
</script>
