<template>
  <div class="table-wipe">
    <div class="medbio-click-proxy" v-click aria-hidden="true" />
    <div class="table-wipe__panel" :class="{ 'is-open': open }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNav } from "@slidev/client";
import { computed } from "vue";

const { clicks } = useNav();
const open = computed(() => clicks.value >= 1);
</script>

<style scoped>
.table-wipe__panel {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 0.8s ease-in-out;
}

.table-wipe__panel.is-open {
  clip-path: inset(0 0 0% 0);
}
</style>
