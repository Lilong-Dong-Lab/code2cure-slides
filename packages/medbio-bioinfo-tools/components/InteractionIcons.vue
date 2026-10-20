<template>
  <div class="medbio-icons">
    <div
      v-for="step in items.length"
      :key="`click-${step}`"
      class="medbio-click-proxy"
      v-click
      aria-hidden="true"
    />
    <div
      v-for="(item, index) in items"
      :key="item.label"
      class="medbio-icon"
      :class="{ 'is-shown': clicks >= index + 1 }"
    >
      <div class="mark">
        <img :src="item.src" alt="" />
      </div>
      {{ item.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNav } from "@slidev/client";

const items = [
  { label: "CLI", src: "/assets/icon-cli.png" },
  { label: "GUI", src: "/assets/icon-gui.png" },
  { label: "Web App", src: "/assets/icon-web.png" },
  { label: "API | Flow", src: "/assets/icon-api.png" },
];

const { clicks } = useNav();
</script>

<style scoped>
.medbio-icons {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  align-content: center;
  margin-top: 0;
  perspective: 1000px;
}

.medbio-icon {
  text-align: center;
  font-weight: 700;
  color: var(--hebmu-primary);
  opacity: 0;
  transform: rotateY(-90deg) scale(1) translateY(0);
  transform-origin: center center;
  backface-visibility: hidden;
}

.medbio-icon.is-shown {
  animation: icon-flip-bounce 0.9s cubic-bezier(0.22, 1.15, 0.36, 1) forwards;
}

@keyframes icon-flip-bounce {
  0% {
    opacity: 0;
    transform: rotateY(-90deg) scale(0.9) translateY(10px);
  }
  40% {
    opacity: 1;
    transform: rotateY(0deg) scale(1) translateY(0);
  }
  58% {
    transform: rotateY(0deg) scale(1.22) translateY(-22px);
  }
  74% {
    transform: rotateY(0deg) scale(0.92) translateY(8px);
  }
  88% {
    transform: rotateY(0deg) scale(1.05) translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: rotateY(0deg) scale(1) translateY(0);
  }
}

.mark {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  margin-bottom: 14px;
  overflow: hidden;
  border-radius: 18px;
}

.mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
