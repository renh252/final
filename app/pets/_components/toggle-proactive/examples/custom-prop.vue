<template>
  <div class="w-full flex flex-col items-center gap-10 border border-gray-300 p-8">
    <toggle-proactive
      :model-value="false"
      disabled
      size="3rem"
      fur-color="#DFC57B"
      pad-color="#FFF"
    />

    <toggle-proactive
      :model-value="true"
      disabled
      size="6rem"
      track-inactive-class="bg-red-400"
      track-active-class="bg-[#DFDFDF]"
      fur-color="#8D6F64"
      pad-color="#000"
    />

    <toggle-proactive
      :model-value="false"
      disabled
      size="4rem"
      track-active-class="bg-[#7DDAEA]"
      fur-color="#F3F2F2"
    />
  </div>
</template>

<script setup lang="ts">
import ToggleProactive from '../toggle-proactive.vue'
</script>
