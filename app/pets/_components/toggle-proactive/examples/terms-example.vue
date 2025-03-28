<template>
  <div class="relative w-full flex flex-center flex-col gap-4 border border-gray-300 p-6">
    <div class="h-[40vh] overflow-y-auto border rounded-xl p-4">
      <h1>🐟 鱈魚使用須知</h1>

      <h2 :ref="titleRefList.set">
        📌 重要聲明
      </h2>
      <p>本指南適用於任何與鱈魚相關的活動，例如食用、觀賞、聊天、或試圖與其建立深厚友誼（不建議）。</p>

      <h2 :ref="titleRefList.set">
        🍽️ 食用須知
      </h2>
      <ul>
        <li>請確保鱈魚已煮熟，除非你是北極熊。</li>
        <li>如果你發現鱈魚在盤子上對你微笑，請確認你沒有嗑藥。</li>
        <li>鱈魚富含不可名狀物質，吃多了可能出現幻覺。</li>
      </ul>

      <h2 :ref="titleRefList.set">
        🐠 觀賞須知
      </h2>
      <ul>
        <li>鱈魚外觀樸素，請勿種族歧視。</li>
        <li>請勿在水族館對著鱈魚說「你好肥」，牠們也有自尊心。</li>
      </ul>

      <h2 :ref="titleRefList.set">
        💬 與鱈魚溝通須知
      </h2>
      <ul>
        <li>鱈魚不會講話，請不要對牠進行長篇演講。</li>
        <li>如果鱈魚對你點頭，請不要高興得太早，牠可能只是因為水流晃動。</li>
        <li>與鱈魚進行心靈溝通時，請確保你沒有餓過頭導致出現幻覺。</li>
      </ul>

      <h2 :ref="titleRefList.set">
        🚨 禁忌事項
      </h2>
      <ol>
        <li>請勿將鱈魚放入洗衣機，可能也洗不乾淨。</li>
        <li>請勿將鱈魚作為武器使用，除非已事先凍成冰塊。</li>
        <li>請勿遛鱈魚，因為他不會走路</li>
      </ol>

      <h2 :ref="titleRefList.set">
        🎉 結語
      </h2>
      <p>請以尊重與幽默的態度對待鱈魚，如有任何不滿，請記得它只是一隻魚</p>
      <p>歡迎提出 MR 補充以上須知</p>
    </div>

    閱讀率：{{ readRate.toFixed(1) }}%

    <label class="w-full flex-center cursor-pointer gap-6 border rounded-xl px-8 py-4 text-lg">
      我已詳閱以上須知

      <toggle-proactive
        v-model="value"
        :disabled
        size="2rem"
      />
    </label>

    <transition name="opacity">
      <div
        v-if="value"
        class="absolute inset-0 z-[40] flex flex-col items-center justify-center gap-6 rounded-xl bg-[#c7f6ff] bg-opacity-90"
      >
        <span class="text-xl tracking-wide">
          感謝您的閱讀！(*´∀`)~♥
        </span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { useTemplateRefsList } from '@vueuse/core'
import { map, pipe } from 'remeda'
import { computed, onMounted, ref } from 'vue'
import { useElementVisibilityTime } from '../../../composables/use-element-visibility-time'
import ToggleProactive from '../toggle-proactive.vue'

const titleRefList = useTemplateRefsList<HTMLElement>()

const timeList = ref<ComputedRef<number>[]>([])
onMounted(() => {
  timeList.value = titleRefList.value.map((el) => {
    const { totalVisibleTime } = useElementVisibilityTime(el)
    return totalVisibleTime
  })
})

/** 最小閱讀時間 */
const MIN_READ_MS = 1000

/** 閱讀率 */
const readRate = computed(() => pipe(
  timeList.value,
  map((time) => time.value > MIN_READ_MS ? MIN_READ_MS : time.value),
  (timeList) => {
    const total = timeList.reduce((acc, time) => acc + time, 0)
    if (total === 0)
      return 0

    return total / (MIN_READ_MS * timeList.length) * 100
  },
))

const disabled = computed(() => readRate.value < 100)
const value = ref(false)
</script>

<style lang="sass" scoped>
.opacity-enter-active, .opacity-leave-active
  transition-duration: 0.4s
.opacity-enter-from, .opacity-leave-to
  opacity: 0 !important
</style>
