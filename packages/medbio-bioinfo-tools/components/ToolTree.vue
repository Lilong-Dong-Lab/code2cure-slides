<template>
  <div ref="root" class="tool-tree">
    <div class="medbio-click-proxy" v-click aria-hidden="true" />
    <svg viewBox="0 0 920 420" role="img" aria-label="生信工具三个层次">
      <path class="branch up" d="M230 210 H280 V90" />
      <path class="branch to-a" d="M280 90 H312" />
      <path class="branch to-b" d="M280 210 H312" />
      <path class="branch down" d="M280 210 V330" />
      <path class="branch to-c" d="M280 330 H312" />
      <path class="branch leaf-line a" d="M540 90 H600" />
      <path class="branch leaf-line b" d="M540 210 H600" />
      <path class="branch leaf-line c" d="M540 330 H600" />
      <polygon class="tip arrow a" points="312,86 320,90 312,94" />
      <polygon class="tip arrow b" points="312,206 320,210 312,214" />
      <polygon class="tip arrow c" points="312,326 320,330 312,334" />
      <circle class="tip dot a" cx="606" cy="90" r="4" />
      <circle class="tip dot b" cx="606" cy="210" r="4" />
      <circle class="tip dot c" cx="606" cy="330" r="4" />
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
import { onMounted, ref, watch } from "vue";

gsap.registerPlugin(DrawSVGPlugin);

const root = ref<HTMLElement | null>(null);
const { clicks } = useNav();
let tween: gsap.core.Timeline | null = null;

function sync(step: number) {
  if (!tween) return;
  if (step >= 1) tween.play();
  else tween.reverse();
}

function at(scope: HTMLElement, selector: string) {
  const node = scope.querySelector(selector);
  if (!node) throw new Error(`Missing ${selector}`);
  return node;
}

onMounted(() => {
  const scope = root.value;
  if (!scope) return;
  const lead = scope.parentElement?.querySelector(".tool-tree-lead");
  const nodes = [
    scope.querySelector(".root-node"),
    scope.querySelector(".mid-a"),
    scope.querySelector(".mid-b"),
    scope.querySelector(".mid-c"),
    scope.querySelector(".leaf-a"),
    scope.querySelector(".leaf-b"),
    scope.querySelector(".leaf-c"),
    ...scope.querySelectorAll(".tip"),
  ].filter((node) => node !== null);
  gsap.set(nodes, { autoAlpha: 0 });
  tween = gsap.timeline({ paused: true });
  const draw = { drawSVG: 0, duration: 0.4, ease: "power1.inOut" };
  const fade = { autoAlpha: 1, duration: 0.5, ease: "power1.out" };
  if (lead) tween.to(lead, fade, 0);
  tween.to(at(scope, ".root-node"), fade, 0.65);
  tween.from(at(scope, ".up"), draw, 1.25);
  tween.from(at(scope, ".to-a"), { ...draw, duration: 0.3 }, 1.7);
  tween.to(at(scope, ".arrow.a"), { autoAlpha: 1, duration: 0.12 }, 1.95);
  tween.to(at(scope, ".mid-a"), fade, 1.75);
  tween.from(at(scope, ".leaf-line.a"), { ...draw, duration: 0.28 }, 2.35);
  tween.to(at(scope, ".dot.a"), { autoAlpha: 1, duration: 0.12 }, 2.58);
  tween.to(at(scope, ".leaf-a"), { ...fade, duration: 0.4 }, 2.7);
  tween.from(at(scope, ".to-b"), { ...draw, duration: 0.3 }, 3.3);
  tween.to(at(scope, ".arrow.b"), { autoAlpha: 1, duration: 0.12 }, 3.55);
  tween.to(at(scope, ".mid-b"), fade, 3.35);
  tween.from(at(scope, ".leaf-line.b"), { ...draw, duration: 0.28 }, 3.95);
  tween.to(at(scope, ".dot.b"), { autoAlpha: 1, duration: 0.12 }, 4.18);
  tween.to(at(scope, ".leaf-b"), { ...fade, duration: 0.4 }, 4.3);
  tween.from(at(scope, ".down"), draw, 4.9);
  tween.from(at(scope, ".to-c"), { ...draw, duration: 0.3 }, 5.3);
  tween.to(at(scope, ".arrow.c"), { autoAlpha: 1, duration: 0.12 }, 5.55);
  tween.to(at(scope, ".mid-c"), fade, 5.35);
  tween.from(at(scope, ".leaf-line.c"), { ...draw, duration: 0.28 }, 5.95);
  tween.to(at(scope, ".dot.c"), { autoAlpha: 1, duration: 0.12 }, 6.18);
  tween.to(at(scope, ".leaf-c"), { ...fade, duration: 0.4 }, 6.3);
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
  stroke: var(--hebmu-primary);
  stroke-width: 2;
  stroke-linecap: round;
}

.tip {
  fill: var(--hebmu-primary);
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
  left: 320px;
  width: 220px;
  height: 64px;
  font-size: 20px;
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
  left: 616px;
  width: 270px;
  margin: 0;
  color: var(--hebmu-text);
  font-size: 20px;
  font-weight: 400;
  line-height: 1.2;
}

.leaf-a {
  top: 78px;
}
.leaf-b {
  top: 198px;
}
.leaf-c {
  top: 318px;
}
</style>

<style>
.tool-tree-lead {
  opacity: 0;
}
</style>
