<template>
  <div>
    <div class="medbio-click-proxy" v-click aria-hidden="true" />
    <div ref="root">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNav } from "@slidev/client";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { onMounted, ref, watch } from "vue";

gsap.registerPlugin(SplitText);

const props = withDefaults(defineProps<{ at?: number }>(), { at: 1 });
const root = ref<HTMLElement | null>(null);
const { clicks } = useNav();
let tween: gsap.core.Tween | null = null;

function sync(step: number) {
  if (!tween) return;
  if (step >= props.at) tween.play();
  else tween.reverse();
}

onMounted(async () => {
  await document.fonts.ready;
  if (!root.value) return;
  const split = SplitText.create(root.value, { type: "chars", aria: "auto" });
  tween = gsap.from(split.chars, {
    opacity: 0,
    duration: 0.8,
    stagger: 0.012,
    ease: "power1.out",
    paused: true,
  });
  sync(clicks.value);
});

watch(clicks, (step) => sync(step));
</script>
