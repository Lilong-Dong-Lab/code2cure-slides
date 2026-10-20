<template>
  <div class="pipeline-flow" :class="{ 'has-active': active > 0 }">
    <template v-for="(stage, index) in stages" :key="stage.id">
      <div
        class="pipeline-stage"
        :class="{
          'is-active': active === index + 1,
          'is-dimmed': active > 0 && active !== index + 1,
          'is-tall': Array.isArray(stage.title),
        }"
        :style="{
          '--stage-top': stage.top,
          '--stage-bot': stage.bot,
          viewTransitionName: stage.id,
        }"
      >
        <template v-if="Array.isArray(stage.title)">
          <span v-for="line in stage.title" :key="line">{{ line }}</span>
        </template>
        <template v-else>
          {{ stage.title }}
        </template>
      </div>
      <div
        v-if="index < stages.length - 1"
        class="pipeline-arrow"
        aria-hidden="true"
      >
        <svg viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2 12h18M14 4l10 8-10 8"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 1-based index of the highlighted stage; 0 = none */
    active?: number;
  }>(),
  { active: 0 },
);

/** Top/bottom stops sampled from the Keynote overview slide. */
const stages = [
  { id: "stage-discovery", title: "靶点发现", top: "#64b2b4", bot: "#089197" },
  { id: "stage-validation", title: "靶点确证", top: "#9fc5b4", bot: "#5a9a78" },
  { id: "stage-hit", title: "先导发现", top: "#e8d4a0", bot: "#c9a44a" },
  { id: "stage-lead", title: "先导优化", top: "#f0b060", bot: "#d17907" },
  {
    id: "stage-clinical",
    title: ["临床前实验", "临床实验"],
    top: "#e87868",
    bot: "#c1361c",
  },
];
</script>

<style scoped>
.pipeline-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.pipeline-stage {
  --stage-top: #888;
  --stage-bot: #444;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1 1 0;
  min-width: 0;
  min-height: 58px;
  padding: 6px 4px;
  border-radius: 12px;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-shadow: 0 1px 1px rgb(0 0 0 / 22%);
  /* Keynote-like stack: gloss → base diagonal fill → soft depth */
  background:
    linear-gradient(
      180deg,
      rgb(255 255 255 / 38%) 0%,
      rgb(255 255 255 / 10%) 38%,
      transparent 55%
    ),
    linear-gradient(165deg, var(--stage-top) 0%, var(--stage-bot) 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 55%),
    inset 0 -2px 3px rgb(0 0 0 / 14%),
    0 4px 10px rgb(0 0 0 / 18%),
    0 1px 2px rgb(0 0 0 / 12%);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.pipeline-stage.is-tall {
  flex: 1.12 1 0;
  min-height: 64px;
  gap: 1px;
  font-size: 16px;
  padding: 5px 3px;
}

.pipeline-flow.has-active .pipeline-stage.is-dimmed {
  opacity: 0.42;
}

.pipeline-flow.has-active .pipeline-stage.is-active {
  transform: scale(1.04);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 55%),
    inset 0 -2px 3px rgb(0 0 0 / 14%),
    0 6px 14px rgb(0 0 0 / 26%),
    0 0 0 3px color-mix(in srgb, var(--hebmu-primary) 35%, transparent);
}

.pipeline-arrow {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  color: #5a5a5a;
}

.pipeline-arrow svg {
  width: 18px;
  height: 16px;
  display: block;
}
</style>
