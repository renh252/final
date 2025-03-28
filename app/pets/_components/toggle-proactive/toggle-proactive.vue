<template>
  <div class="cursor-pointer select-none overflow-visible">
    <div
      class="toggle-proactive"
      @click="handleToggle"
    >
      <div
        :id="`${uid}-cat-arm`"
        class="relative h-full w-full"
      >
        <!-- arm -->
        <svg
          viewBox="0 0 640 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          :class="svgClass"
        >
          <g>
            <path
              id="arm"
              d="M308 75C319 75.0002 361.5 75.0002 373 75.0001"
              :stroke="furColor"
              stroke-width="80"
              stroke-linecap="round"
            />
          </g>
        </svg>

        <!-- elbow -->
        <svg
          id="cat-elbow"
          viewBox="0 0 640 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          :class="svgClass"
        >
          <g>
            <path
              id="elbow"
              d="M322 75C345 75 383.5 75 399.5 75"
              :stroke="furColor"
              stroke-width="80"
              stroke-linecap="round"
            />
            <g id="pads">
              <path
                id="metacarpal-pad"
                d="M408.941 75.0441C408.941 86.6665 399.875 96.0882 388.691 96.0882C377.507 96.0882 374 87.562 374 75.9396C374 64.3173 377.507 54 388.691 54C399.875 54 408.941 63.4218 408.941 75.0441Z"
                :fill="padColor"
              />
              <path
                id="digital-pad-1"
                d="M420.5 53.1618C420.5 56.0125 416.628 58.3235 413.338 58.3235C410.049 58.3235 407.382 56.0125 407.382 53.1618C407.382 50.311 410.049 48 413.338 48C416.628 48 420.5 50.311 420.5 53.1618Z"
                :fill="padColor"
              />
              <path
                id="digital-pad-2"
                d="M419 96.8383C419 99.689 415.834 102 412.544 102C409.255 102 406.588 99.689 406.588 96.8383C406.588 93.9875 409.255 91.6765 412.544 91.6765C415.834 91.6765 419 93.9875 419 96.8383Z"
                :fill="padColor"
              />
              <path
                id="digital-pad-3"
                d="M432 67.4559C432 70.7452 427.473 73.4118 422.868 73.4118C418.262 73.4118 414.529 70.7452 414.529 67.4559C414.529 64.1665 418.262 61.5 422.868 61.5C427.473 61.5 432 64.1665 432 67.4559Z"
                :fill="padColor"
              />
              <path
                id="digital-pad-4"
                d="M432 82.544C432 85.8334 427.473 88.4999 422.868 88.4999C418.262 88.4999 414.529 85.8334 414.529 82.544C414.529 79.2547 418.262 76.5881 422.868 76.5881C427.473 76.5881 432 79.2547 432 82.544Z"
                :fill="padColor"
              />
            </g>
          </g>
        </svg>

        <div
          class="track z-0"
          :class="currentTrackClass"
        >
          <div
            class="thumb rounded-full"
            :class="currentThumbClass"
          />
        </div>
      </div>

      <div
        v-if="keyframeVisible"
        :id="uid"
        class="keyframes hidden"
      >
        <!-- 1 -->
        <svg
          width="640"
          height="155"
          viewBox="0 0 640 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="cat-arm-1">
            <path
              id="arm"
              d="M308 75C319 75.0002 361.5 75.0002 373 75.0001"
              stroke="#DFDFDF"
              stroke-width="80"
              stroke-linecap="round"
            />
            <path
              id="elbow"
              d="M322 75C345 75 383.5 75 399.5 75"
              stroke="#DFDFDF"
              stroke-width="80"
              stroke-linecap="round"
            />
            <g id="pads">
              <path
                id="metacarpal-pad"
                d="M408.941 75.0441C408.941 86.6665 399.875 96.0882 388.691 96.0882C377.507 96.0882 374 87.562 374 75.9396C374 64.3173 377.507 54 388.691 54C399.875 54 408.941 63.4218 408.941 75.0441Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-1"
                d="M420.5 53.1618C420.5 56.0125 416.628 58.3235 413.338 58.3235C410.049 58.3235 407.382 56.0125 407.382 53.1618C407.382 50.311 410.049 48 413.338 48C416.628 48 420.5 50.311 420.5 53.1618Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-2"
                d="M419 96.8383C419 99.689 415.834 102 412.544 102C409.255 102 406.588 99.689 406.588 96.8383C406.588 93.9875 409.255 91.6765 412.544 91.6765C415.834 91.6765 419 93.9875 419 96.8383Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-3"
                d="M432 67.4559C432 70.7452 427.473 73.4118 422.868 73.4118C418.262 73.4118 414.529 70.7452 414.529 67.4559C414.529 64.1665 418.262 61.5 422.868 61.5C427.473 61.5 432 64.1665 432 67.4559Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-4"
                d="M432 82.544C432 85.8334 427.473 88.4999 422.868 88.4999C418.262 88.4999 414.529 85.8334 414.529 82.544C414.529 79.2547 418.262 76.5881 422.868 76.5881C427.473 76.5881 432 79.2547 432 82.544Z"
                fill="#FFA5A5"
              />
            </g>
          </g>
        </svg>
        <!-- 2 -->
        <svg
          width="640"
          height="155"
          viewBox="0 0 640 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="cat-arm-2">
            <path
              id="arm"
              d="M308 75C319 75.0002 518.5 75.0001 530 75"
              stroke="#DFDFDF"
              stroke-width="80"
              stroke-linecap="round"
            />
            <path
              id="elbow"
              d="M531.5 75C554.5 75 563.5 75 579.5 75"
              stroke="#DFDFDF"
              stroke-width="80"
              stroke-linecap="round"
            />
            <g id="pads">
              <path
                id="metacarpal-pad"
                d="M588.941 75.0441C588.941 86.6665 579.875 96.0882 568.691 96.0882C557.507 96.0882 554 87.562 554 75.9396C554 64.3173 557.507 54 568.691 54C579.875 54 588.941 63.4218 588.941 75.0441Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-1"
                d="M600 53.1618C600 56.0125 596.628 58.3235 593.338 58.3235C590.049 58.3235 587.382 56.0125 587.382 53.1618C587.382 50.311 590.049 48 593.338 48C596.628 48 600 50.311 600 53.1618Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-2"
                d="M599 97.5C599 100.351 595.834 102 592.544 102C589.255 102 586.588 99.689 586.588 96.8383C586.588 93.9875 589.255 91.6765 592.544 91.6765C595.834 91.6765 599 94.6492 599 97.5Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-3"
                d="M612 67.4559C612 70.7452 607.473 73.4118 602.868 73.4118C598.262 73.4118 594.529 70.7452 594.529 67.4559C594.529 64.1665 598.262 61.5 602.868 61.5C607.473 61.5 612 64.1665 612 67.4559Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-4"
                d="M612 82.544C612 85.8334 607.473 88.4999 602.868 88.4999C598.262 88.4999 594.529 85.8334 594.529 82.544C594.529 79.2547 598.262 76.5881 602.868 76.5881C607.473 76.5881 612 79.2547 612 82.544Z"
                fill="#FFA5A5"
              />
            </g>
          </g>
        </svg>

        <!-- 3 -->
        <svg
          width="640"
          height="155"
          viewBox="0 0 640 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="cat-arm-3">
            <path
              id="arm"
              d="M308 75.0002C319 75.0004 497 68.5002 524.5 75.0002"
              stroke="#DFDFDF"
              stroke-width="80"
              stroke-linecap="round"
            />
            <path
              id="elbow"
              d="M514 74.76C528.5 75.76 536 72.76 541 80.26"
              stroke="#DFDFDF"
              stroke-width="80"
              stroke-linecap="round"
            />
            <g id="pads">
              <path
                id="metacarpal-pad"
                d="M545.317 80.1338C541.584 91.1404 539.242 101.823 531.799 99.2985C524.356 96.7743 521.955 85.1404 525.688 74.1338C529.421 63.1272 537.874 56.916 545.317 59.4402C552.76 61.9645 549.05 69.1272 545.317 80.1338Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-1"
                d="M553.5 57.7598C552.584 60.4595 551.756 62.5057 548.641 61.4492C545.525 60.3928 543.742 57.3478 544.658 54.648C545.574 51.9483 548.841 50.6162 551.956 51.6727C555.071 52.7292 554.416 55.06 553.5 57.7598Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-2"
                d="M537.139 103.931C536.223 106.631 535.756 108.506 532.641 107.449C529.525 106.393 527.742 103.348 528.658 100.648C529.574 97.9486 532.841 96.6165 535.956 97.6729C539.071 98.7294 538.054 101.231 537.139 103.931Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-3"
                d="M554.633 74.9987C553.577 78.1138 552.869 80.7094 550.069 79.7599C547.269 78.8104 545.856 75.5154 546.913 72.4003C547.969 69.2853 551.095 67.5297 553.895 68.4792C556.694 69.4287 555.69 71.8837 554.633 74.9987Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-4"
                d="M548.366 89.5022C547.31 92.6172 546.335 95.5283 543.725 94.6432C541.115 93.7582 539.856 90.5154 540.913 87.4003C541.969 84.2853 544.941 82.4775 547.551 83.3626C550.161 84.2477 549.423 86.3871 548.366 89.5022Z"
                fill="#FFA5A5"
              />
            </g>
          </g>
        </svg>

        <!-- 4 -->
        <svg
          width="640"
          height="155"
          viewBox="0 0 640 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="cat-arm-4">
            <path
              id="arm"
              d="M308 75C319 75.0002 446.5 52.9998 526 75"
              stroke="#DFDFDF"
              stroke-width="80"
              stroke-linecap="round"
            />
            <path
              id="elbow"
              d="M524 75C548.5 75 537.5 105 506 105"
              stroke="#DFDFDF"
              stroke-width="80"
              stroke-linecap="round"
            />
            <g id="pads">
              <path
                id="metacarpal-pad"
                d="M524.193 105.216C523.256 116.8 522.38 127.633 522.38 127.633C522.38 127.633 523.206 117.42 524.143 105.836C525.08 94.2513 525.773 85.6821 525.773 85.6821C525.773 85.6821 525.13 93.631 524.193 105.216Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-1"
                d="M525.412 82.4362C525.182 85.2777 525.004 87.4745 525.004 87.4745C525.004 87.4745 525.19 85.171 525.42 82.3295C525.65 79.488 525.836 77.1846 525.836 77.1846C525.837 77.1846 525.642 79.5947 525.412 82.4362Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-2"
                d="M519.385 128.56C519.156 131.401 519 133.321 519 133.321C519 133.321 519.187 131.018 519.416 128.176C519.646 125.335 519.833 123.031 519.833 123.031C519.833 123.031 519.615 125.718 519.385 128.56Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-3"
                d="M523.203 97.0482C522.938 100.327 522.721 103.004 522.721 103.004C522.721 103.004 522.936 100.346 523.201 97.0671C523.467 93.7885 523.682 91.1306 523.682 91.1306C523.682 91.1306 523.468 93.7696 523.203 97.0482Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-4"
                d="M520.828 111.705C520.563 114.984 520.315 118.044 520.315 118.044C520.315 118.044 520.53 115.386 520.795 112.107C521.06 108.829 521.275 106.171 521.275 106.171C521.275 106.171 521.093 108.427 520.828 111.705Z"
                fill="#FFA5A5"
              />
            </g>
          </g>
        </svg>

        <!-- 5 -->
        <svg
          width="640"
          height="155"
          viewBox="0 0 640 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="cat-arm-5">
            <path
              id="arm"
              d="M308 75.0004C319 75.0006 521 50.4999 533.5 83.5"
              stroke="#DFDFDF"
              stroke-width="80"
              stroke-linecap="round"
            />
            <path
              id="elbow"
              d="M531.5 82C559.5 91 449 122 405.5 102.5"
              stroke="#DFDFDF"
              stroke-width="80"
              stroke-linecap="round"
            />
            <g id="pads">
              <path
                id="metacarpal-pad"
                d="M399.888 108.52C396.155 119.526 392.664 129.819 392.664 129.819C392.664 129.819 395.955 120.115 399.688 109.109C403.421 98.1023 406.182 89.9607 406.182 89.9607C406.182 89.9607 403.621 97.513 399.888 108.52Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-1"
                d="M406.623 86.7247C405.708 89.4245 405 91.5117 405 91.5117C405 91.5117 405.742 89.3231 406.658 86.6234C407.573 83.9237 408.315 81.7351 408.315 81.7351C408.316 81.7351 407.539 84.025 406.623 86.7247Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-2"
                d="M389.535 129.988C388.619 132.687 388 134.511 388 134.511C388 134.511 388.742 132.323 389.658 129.623C390.574 126.923 391.316 124.735 391.316 124.735C391.316 124.735 390.45 127.288 389.535 129.988Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-3"
                d="M400.919 100.357C399.862 103.472 399 106.016 399 106.016C399 106.016 399.856 103.49 400.913 100.375C401.969 97.2601 402.826 94.7349 402.826 94.7349C402.826 94.7349 401.975 97.2422 400.919 100.357Z"
                fill="#FFA5A5"
              />
              <path
                id="digital-pad-4"
                d="M395.042 113.993C393.986 117.108 393 120.016 393 120.016C393 120.016 393.856 117.491 394.913 114.375C395.969 111.26 396.826 108.735 396.826 108.735C396.826 108.735 396.099 110.878 395.042 113.993Z"
                fill="#FFA5A5"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>

    <input
      type="checkbox"
      class="hidden"
      @click="handleToggle"
    >
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { promiseTimeout, useToggle, useVModel } from '@vueuse/core'
import anime from 'animejs'
import { debounce } from 'lodash-es'
import { omit, pipe } from 'remeda'
import { computed, onBeforeMount, onMounted, ref, useId } from 'vue'

// #region Props
interface Props {
  modelValue: boolean;
  disabled?: boolean;
  /** @default '4rem' */
  size?: string;

  /** @default 'rounded-full' */
  trackClass?: string;
  /** @default 'bg-[#DFDFDF]' */
  trackInactiveClass?: string;
  /** @default 'bg-green-500' */
  trackActiveClass?: string;
  /** @default 'bg-white' */
  thumbClass?: string;
  /** @default '' */
  thumbInactiveClass?: string;
  /** @default '' */
  thumbActiveClass?: string;

  /** @default '#444' */
  furColor?: string;
  /** @default '#FFA5A5' */
  padColor?: string;
}
// #endregion Props

// #region Emits
interface Emits {
  'update:modelValue': [value: boolean];
}
// #endregion Emits

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: '4rem',

  trackClass: 'rounded-full',
  trackInactiveClass: 'bg-[#DFDFDF]',
  trackActiveClass: 'bg-green-500',
  thumbClass: 'bg-white',
  thumbInactiveClass: '',
  thumbActiveClass: '',

  furColor: '#444',
  padColor: '#FFA5A5',
})

const emit = defineEmits<Emits>()

const OBJECT_ID_LIST = [
  'cat-elbow',
  'arm',
  'elbow',
  'metacarpal-pad',
  'pads',
  'digital-pad-1',
  'digital-pad-2',
  'digital-pad-3',
  'digital-pad-4',
] as const

const KEYFRAME_ID_LIST = [
  'cat-arm-1',
  'cat-arm-2',
  'cat-arm-3',
  'cat-arm-4',
  'cat-arm-5',
] as const

const uid = useId()
const modelValue = useVModel(props, 'modelValue', emit)
const [currentValue, toggleCurrentValue] = useToggle(modelValue.value)

interface KeyframeOption extends anime.AnimeParams {
  action?: () => void;
  objectAttrMap?: Partial<Record<
    typeof OBJECT_ID_LIST[number],
    CSSProperties
  >>;
}
const keyframeOptionMap: Record<
  'in' | 'out',
  Record<
    typeof KEYFRAME_ID_LIST[number],
    KeyframeOption
  >
> = {
  in: {
    'cat-arm-1': {},
    'cat-arm-2': {
      easing: 'easeInOutQuad',
      duration: 200,
      objectAttrMap: {
        // 動態切換 z-index，才能讓手肘伸出後，蓋在 toggle 上
        'cat-elbow': { zIndex: 1 },
      },
    },
    'cat-arm-3': {
      easing: 'linear',
      duration: 50,
    },
    'cat-arm-4': {
      easing: 'linear',
      duration: 50,
    },
    'cat-arm-5': {
      easing: 'easeOutBack',
      duration: 200,
    },
  },
  out: {
    'cat-arm-5': {},
    'cat-arm-4': {
      easing: 'easeInQuad',
      duration: 100,
    },
    'cat-arm-3': {
      easing: 'linear',
      duration: 60,
    },
    'cat-arm-2': {
      easing: 'linear',
      duration: 60,
      objectAttrMap: {
        'cat-elbow': { zIndex: 0 },
      },
    },
    'cat-arm-1': {
      easing: 'linear',
      duration: 100,
    },
  },
} as const

const [isPlaying, togglePlaying] = useToggle(false)

const svgClass = ref<string[]>([])

const currentTrackClass = computed(() => {
  const result = [
    props.trackClass,
  ]

  if (currentValue.value) {
    result.push(props.trackActiveClass)
  }
  else {
    result.push(props.trackInactiveClass)
  }

  return result
})

const currentThumbClass = computed(() => {
  const result = [
    props.thumbClass,
  ]

  if (currentValue.value) {
    result.push(props.thumbActiveClass)
    result.push('active')
  }
  else {
    result.push(props.thumbInactiveClass)
  }

  return result
})

/** 儲存 keyframe attr 資料後隱藏 keyframe DOM  */
const keyframeVisible = ref(true)
/** 儲存 keyframe attr 資料 */
const keyframeAttrMap: Partial<Record<
  (typeof KEYFRAME_ID_LIST)[number],
  Record<
    (typeof OBJECT_ID_LIST)[number],
    Record<string, string>
  >
>> = {}
onMounted(() => {
  KEYFRAME_ID_LIST.forEach((keyframeId) => {
    OBJECT_ID_LIST.forEach((objectId) => {
      // 取得所有 attr
      const attrMap = pipe(
        document.querySelector(`#${uid} #${keyframeId} #${objectId}`)?.attributes,
        (attrNode) => {
          if (!attrNode)
            return {}

          const result: Record<string, string> = {}
          for (let i = 0; i < attrNode.length; i++) {
            const node = attrNode[i]
            if (!node)
              continue

            const { name, value } = node
            result[name] = value
          }
          return result
        },
        omit(['id', 'ref', 'fill', 'stroke', 'stroke-width', 'stroke-linecap']),
      )

      const data = {
        ...keyframeAttrMap[keyframeId],
        [objectId]: attrMap,
      } as Record<typeof OBJECT_ID_LIST[number], Record<string, string>>

      keyframeAttrMap[keyframeId] = data
    })
  })

  keyframeVisible.value = false
})

/** 播放至指定 keyframe */
function toKeyframe(
  direction: keyof typeof keyframeOptionMap,
  keyframeId: (typeof KEYFRAME_ID_LIST)[number],
) {
  const tasks = OBJECT_ID_LIST.map((objectId) => {
    // 取得所有 attr
    const attrMap = keyframeAttrMap[keyframeId]?.[objectId]
    if (!attrMap) {
      throw new Error(`找不到 keyframeAttrMap[${keyframeId}][${objectId}]`)
    }

    const objectAttr = keyframeOptionMap[direction][keyframeId].objectAttrMap?.[objectId]

    return anime({
      targets: `#${uid}-cat-arm #${objectId}`,
      ...attrMap,
      ...keyframeOptionMap[direction][keyframeId],
      ...objectAttr,
    }).finished
  })

  return Promise.all(tasks)
}

const handleToggle = debounce(() => {
  if (isPlaying.value)
    return

  if (props.disabled) {
    toggleCurrentValue()
    startCatAnimate()
    return
  }

  currentValue.value = !currentValue.value
  modelValue.value = currentValue.value
}, 50)

/** 延遲時間，會越按越短，更有不耐煩的感覺
 *
 * 最長 1 秒鐘
 */
let delayMs = 1000

/** 沒有動作超過 2s 後重設 DelayMs */
const resetDelayMs = debounce(() => {
  delayMs = 1000
}, 2000)

/** 開始貓貓手動畫 */
async function startCatAnimate(delay?: number) {
  if (currentValue.value) {
    svgClass.value = []
  }
  else {
    svgClass.value = ['mirror']
  }

  togglePlaying(true)

  delayMs = Math.max(0, delayMs - 300)
  resetDelayMs()

  await promiseTimeout(delay ?? delayMs)

  for (const id of [
    'cat-arm-2',
    'cat-arm-3',
    'cat-arm-4',
  ] as const) {
    await toKeyframe('in', id)
  }

  // toggle 與 cat-arm-5 同時執行的動畫效果看起來更好
  toggleCurrentValue()
  await toKeyframe('in', 'cat-arm-5')

  for (const id of [
    'cat-arm-4',
    'cat-arm-3',
    'cat-arm-2',
    'cat-arm-1',
  ] as const) {
    await toKeyframe('out', id)
  }
  togglePlaying(false)
}

onBeforeMount(() => {
  anime.remove(OBJECT_ID_LIST.map((id) => `#${id}`))
})

// #region Methods
interface Expose {
  /** 觸發切換動畫 */
  toggle: () => Promise<void>;
}
// #endregion Methods

defineExpose<Expose>({
  async toggle() {
    if (isPlaying.value)
      return

    await startCatAnimate(0)

    modelValue.value = currentValue.value
  },
})
</script>

<style scoped lang="sass">
.toggle-proactive
  aspect-ratio: 1.8
  height: v-bind('props.size')
  .track
    position: relative
    width: 100%
    height: 100%
    transition-duration: 0.4s
  .thumb
    position: absolute
    height: 80%
    top: 10%
    left: 50%
    aspect-ratio: 1
    transition-duration: 0.4s
    transform: translateX(-100%)
    transition-timing-function: cubic-bezier(0.505, -0.005, 0.005, 1.230)
    &.active
      transform: translateX(0%)
  svg
    position: absolute
    top: 0
    left: 50%
    height: 100%
    aspect-ratio: 640 / 155
    transform: translateX(-50%)

.mirror
  scale: -1 1
  transform-origin: left center
</style>
