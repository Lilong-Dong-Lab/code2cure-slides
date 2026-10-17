<template>
  <div>
    <div
      v-for="n in motion === 'flip' ? stages.length : 0"
      :key="n"
      class="medbio-click-proxy"
      v-click
      aria-hidden="true"
    />
    <div ref="row" class="stages">
      <div
        v-for="(stage, index) in stages"
        :key="stage.id"
        class="medbio-stage"
        :class="{ 'is-active': index + 1 === shown }"
        :style="{ viewTransitionName: stage.id }"
      >
        {{ stage.title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNav } from "@slidev/client";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { nextTick, onMounted, ref, watch } from "vue";

gsap.registerPlugin(Flip);

const stages = [
  { id: "stage-discovery", title: "靶点发现" },
  { id: "stage-validation", title: "靶点确证" },
  { id: "stage-hit", title: "先导发现" },
  { id: "stage-lead", title: "先导优化" },
  { id: "stage-preclinical", title: "临床前实验" },
  { id: "stage-clinical", title: "临床实验" },
];

const props = withDefaults(
  defineProps<{ motion?: "flip" | "static"; active?: number }>(),
  { motion: "static", active: 0 },
);

const { clicks } = useNav();
const shown = ref(props.active);

function apply(step: number) {
  shown.value = props.motion === "flip" ? step : props.active;
}

onMounted(() => apply(clicks.value));

watch(
  clicks,
  async (step, previous) => {
    if (props.motion !== "flip") return;
    if (previous === undefined) {
      apply(step);
      return;
    }
    const state = Flip.getState(".medbio-stage");
    apply(step);
    await nextTick();
    Flip.from(state, {
      duration: 0.55,
      ease: "power1.inOut",
      absolute: true,
    });
  },
  { flush: "pre" },
);
</script>

<style scoped>
.stages {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.medbio-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  border: 2px solid var(--hebmu-border);
  border-radius: 10px;
  color: var(--hebmu-primary);
  font-size: 24px;
  font-weight: 700;
}

.medbio-stage.is-active {
  background: var(--hebmu-primary);
  color: #fff;
}
</style>
