<template>
  <div
    ref="root"
    class="interaction-layer"
    :class="isGrid ? 'is-grid' : 'is-row'"
  >
    <Teleport v-if="showTitle && titleMount" :to="titleMount">
      <h1 class="keynote-slide-title interaction-slide-title">
        {{ titleText }}
      </h1>
    </Teleport>

    <div
      v-for="step in 5"
      :key="`click-${step}`"
      class="medbio-click-proxy"
      v-click
      aria-hidden="true"
    />
    <div class="interaction-icons">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="medbio-icon"
        :class="{
          'is-shown': appeared[index] || isGrid,
          'is-bounce': !isGrid && clicks === index + 1,
        }"
        :data-magic-id="item.id"
      >
        <div class="mark">
          <img :src="item.src" alt="" />
        </div>
        {{ item.label }}
      </div>
    </div>
    <div class="interaction-copy" :class="{ 'is-shown': isGrid }">
      <p class="lead">目标蛋白：EGFR</p>
      <p class="note">（表皮生长因子，<br />非小细胞肺癌靶点）</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNav } from "@slidev/client";
import gsap from "gsap";
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";

const TITLE_ROW = "生信工具总览 ｜第三层: 交互方式";
const TITLE_GRID = "生信工具总览 ｜同一个靶点，四种体验";

const items = [
  { id: "icon-cli", label: "CLI", src: "/assets/icon-cli.png" },
  { id: "icon-gui", label: "GUI", src: "/assets/icon-gui.png" },
  { id: "icon-web", label: "Web App", src: "/assets/icon-web.png" },
  { id: "icon-api", label: "API | Flow", src: "/assets/icon-api.png" },
];

const root = ref<HTMLElement | null>(null);
const hostPage = ref<number | null>(null);
const titleMount = ref<string | null>(null);
const { clicks, currentSlideNo } = useNav();
const isGrid = computed(() => clicks.value >= 5);
const titleText = computed(() => (isGrid.value ? TITLE_GRID : TITLE_ROW));
const showTitle = computed(
  () => hostPage.value !== null && currentSlideNo.value === hostPage.value,
);
const appeared = reactive([false, false, false, false]);

let flipTween: gsap.core.Timeline | null = null;

function iconNodes() {
  if (!root.value) return [] as HTMLElement[];
  return gsap.utils.toArray<HTMLElement>(
    root.value.querySelectorAll("[data-magic-id]"),
  );
}

function resolveHostPage() {
  const page = root.value?.closest("[class*='slidev-page-']");
  const match = page?.className.match(/slidev-page-(\d+)/);
  return match ? Number(match[1]) : null;
}

function slideScale() {
  const no = hostPage.value ?? currentSlideNo.value;
  const page = document.querySelector(
    `.slidev-page-${no}`,
  ) as HTMLElement | null;
  if (!page) return 1;
  return page.getBoundingClientRect().width / 1024;
}

function settleIcons(targets: HTMLElement[]) {
  targets.forEach((el) => {
    el.style.animation = "none";
  });
  gsap.set(targets, {
    clearProps: "animation",
    opacity: 1,
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotateY: 0,
    rotateX: 0,
    transformOrigin: "50% 50%",
  });
}

onMounted(async () => {
  await nextTick();
  hostPage.value = resolveHostPage();
  if (hostPage.value !== null) {
    titleMount.value = `.slidev-page-${hostPage.value} .keynote-layout`;
  }
});

watch(titleText, async (_text, prev) => {
  if (!prev || !showTitle.value) return;
  await nextTick();
  const el = document.querySelector(
    `.slidev-page-${hostPage.value} .interaction-slide-title`,
  ) as HTMLElement | null;
  if (!el) return;
  gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.28 });
});

watch(
  clicks,
  (n) => {
    for (let i = 0; i < appeared.length; i++) {
      appeared[i] = n >= 5 || n >= i + 1;
    }
  },
  { immediate: true },
);

watch(
  isGrid,
  async (grid, wasGrid) => {
    if (wasGrid === undefined) return;
    if (grid === wasGrid) return;

    const targets = iconNodes();
    settleIcons(targets);

    const from = targets.map((el) => el.getBoundingClientRect());
    await nextTick();
    // Force style/layout so "to" rects reflect the new grid, not the old row.
    void root.value?.offsetWidth;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    const scale = slideScale();

    flipTween?.kill();
    const tl = gsap.timeline({
      onComplete: () => {
        flipTween = null;
        settleIcons(targets);
        gsap.set(targets, { clearProps: "transform" });
      },
    });

    targets.forEach((el, i) => {
      const to = el.getBoundingClientRect();
      const dx = (from[i].left - to.left) / scale;
      const dy = (from[i].top - to.top) / scale;
      const sx = from[i].width / Math.max(to.width, 1);
      const sy = from[i].height / Math.max(to.height, 1);
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.01) {
        return;
      }
      tl.fromTo(
        el,
        {
          x: dx,
          y: dy,
          scaleX: sx,
          scaleY: sy,
          transformOrigin: "top left",
        },
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 0.85,
          ease: "power2.inOut",
        },
        i * 0.03,
      );
    });
    flipTween = tl;
  },
  { flush: "pre" },
);
</script>

<style scoped>
.interaction-layer {
  display: grid;
  align-items: center;
  height: 100%;
  perspective: 1000px;
}

.interaction-layer.is-row {
  grid-template-columns: minmax(0, 1fr);
}

.interaction-layer.is-grid {
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 36px;
}

.interaction-icons {
  display: grid;
  gap: 18px;
  justify-items: center;
  min-width: 0;
}

.is-row .interaction-icons {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-content: center;
}

.is-grid .interaction-icons {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 28px;
}

.medbio-icon {
  width: 100%;
  text-align: center;
  font-weight: 700;
  color: var(--hebmu-primary);
  opacity: 0;
  transform: rotateY(-90deg);
  transform-origin: center center;
  backface-visibility: hidden;
  line-height: 1.2;
}

.is-grid .medbio-icon {
  max-width: 210px;
  font-size: 22px;
  opacity: 1;
  transform: none;
}

.medbio-icon.is-shown {
  opacity: 1;
  transform: none;
}

.medbio-icon.is-bounce {
  animation: icon-flip-bounce 0.9s cubic-bezier(0.22, 1.15, 0.36, 1) forwards;
}

.is-grid .medbio-icon.is-bounce {
  animation: none;
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

.is-grid .mark {
  height: 148px;
  margin-bottom: 10px;
}

.mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.interaction-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-left: 12px;
  color: var(--hebmu-primary);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease 0.15s;
}

.interaction-copy.is-shown {
  opacity: 1;
  pointer-events: auto;
}

.is-row .interaction-copy {
  display: none;
}

.lead,
.note {
  margin: 0;
  color: var(--hebmu-primary);
}

.lead {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
}

.note {
  margin-top: 10px;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.45;
}
</style>
