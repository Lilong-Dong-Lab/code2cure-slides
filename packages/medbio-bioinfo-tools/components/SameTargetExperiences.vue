<template>
  <div class="same-target">
    <div class="same-target-icons">
      <div v-for="item in items" :key="item.label" class="medbio-icon">
        <div class="mark">
          <img :src="item.src" alt="" />
        </div>
        {{ item.label }}
      </div>
    </div>
    <div class="same-target-copy">
      <p class="lead">目标蛋白：EGFR</p>
      <p class="note">（表皮生长因子，<br />非小细胞肺癌靶点）</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = [
  { label: "CLI", src: "/assets/icon-cli.png" },
  { label: "GUI", src: "/assets/icon-gui.png" },
  { label: "Web App", src: "/assets/icon-web.png" },
  { label: "API | Flow", src: "/assets/icon-api.png" },
];
</script>

<style scoped>
.same-target {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 36px;
  align-items: center;
  height: 100%;
}

.same-target-icons {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 28px;
  justify-items: center;
}

.medbio-icon {
  width: 100%;
  max-width: 210px;
  text-align: center;
  font-weight: 700;
  color: var(--hebmu-primary);
  font-size: 22px;
  line-height: 1.2;
}

.mark {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 148px;
  margin-bottom: 10px;
  overflow: hidden;
  border-radius: 18px;
}

.mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.same-target-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-left: 12px;
  color: var(--hebmu-primary);
}

.lead {
  margin: 0;
  color: var(--hebmu-primary);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
}

.note {
  margin: 10px 0 0;
  color: var(--hebmu-primary);
  font-size: 20px;
  font-weight: 400;
  line-height: 1.45;
}
</style>
