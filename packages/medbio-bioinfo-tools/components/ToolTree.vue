<template>
  <div class="tool-tree">
    <div class="medbio-click-proxy" v-click aria-hidden="true" />
    <svg viewBox="0 0 920 420" role="img" aria-label="生信工具三个层次">
      <path class="branch" d="M250 210 H330" />
      <path class="branch" d="M330 90 V330" />
      <path class="branch" d="M330 90 H400" />
      <path class="branch" d="M330 210 H400" />
      <path class="branch" d="M330 330 H400" />
      <path class="branch" d="M620 90 H700" />
      <path class="branch" d="M620 210 H700" />
      <path class="branch" d="M620 330 H700" />
    </svg>
    <div class="root-node">生物信息学<br />工具/资源</div>
    <div class="mid mid-a">分析工具</div>
    <div class="mid mid-b">数据库 / 知识资源</div>
    <div class="mid mid-c">交互方式</div>
    <p class="leaf leaf-a">处理数据的软件程序</p>
    <p class="leaf leaf-b">存储生物信息的仓库</p>
    <p class="leaf leaf-c">使用工具和访问数据的方式</p>
  </div>
</template>

<script setup lang="ts">
import { useNav } from "@slidev/client";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { onMounted, watch } from "vue";

gsap.registerPlugin(DrawSVGPlugin);

const { clicks } = useNav();
let tween: gsap.core.Tween | null = null;

function sync(step: number) {
  if (!tween) return;
  if (step >= 1) tween.play();
  else tween.reverse();
}

onMounted(() => {
  tween = gsap.from(".tool-tree .branch", {
    drawSVG: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: "power1.inOut",
    paused: true,
  });
  sync(clicks.value);
});

watch(clicks, (step) => sync(step));
</script>

<style scoped>
.tool-tree {
  position: relative;
  height: 420px;
}

svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.branch {
  fill: none;
  stroke: #8a8a8a;
  stroke-width: 2;
}

.root-node,
.mid {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hebmu-primary);
  color: #fff;
  font-weight: 700;
  text-align: center;
  border-radius: 10px;
}

.root-node {
  top: 150px;
  left: 0;
  width: 230px;
  height: 120px;
  font-size: 28px;
}

.mid {
  left: 400px;
  width: 220px;
  height: 64px;
  font-size: 22px;
}

.mid-a {
  top: 58px;
}
.mid-b {
  top: 178px;
}
.mid-c {
  top: 298px;
}

.leaf {
  position: absolute;
  left: 700px;
  width: 200px;
  margin: 0;
  font-size: 20px;
}

.leaf-a {
  top: 70px;
}
.leaf-b {
  top: 186px;
}
.leaf-c {
  top: 306px;
}
</style>
