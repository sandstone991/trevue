<script setup lang="ts">
import { cn } from '@/lib/utils'

// port of https://github.com/atlassian/pragmatic-drag-and-drop/blob/main/packages/react-drop-indicator/src/box.tsx to Vue 3
const props = defineProps<{ edge: 'top' | 'bottom' | 'left' | 'right' }>()
const TERMINAL_SIZE = 8
const LINE = {
  borderRadius: 0,
  thickness: 2,
  backgroundColor: '#3730a3'
}
const offsetToAlignTerminalWithLine = (LINE.thickness - TERMINAL_SIZE) / 2
const lineOffset = TERMINAL_SIZE / 2
const localLineOffset = -0.5 * (LINE.thickness + 10)
const edgeToOrientationMap = {
  top: 'horizontal',
  bottom: 'horizontal',
  left: 'vertical',
  right: 'vertical'
} as const
const orientation = edgeToOrientationMap[props.edge]
</script>

<template>
  <div :class="cn('line', orientation, edge)"></div>
</template>

<style scoped>
.line {
  display: block;
  position: absolute;
  z-index: 1;
  pointer-events: none;
  background-color: #3730a3;
}
.line::before {
  content: '';
  width: v-bind("TERMINAL_SIZE + 'px'");
  height: v-bind("TERMINAL_SIZE + 'px'");
  box-sizing: border-box;
  position: absolute;
  border: v-bind("LINE.thickness + 'px solid ' + LINE.backgroundColor");
  border-radius: 50%;
}
.horizontal {
  height: v-bind("LINE.thickness + 'px'");
  left: v-bind("lineOffset + 'px'");
  right: 0;
}
.horizontal::before {
  left: v-bind("-TERMINAL_SIZE + 'px'");
}
.vertical {
  width: v-bind("LINE.thickness + 'px'");
  top: v-bind("lineOffset + 'px'");
  bottom: 0;
}
.vertical::before {
  top: v-bind("-TERMINAL_SIZE + 'px'");
}
.top {
  top: v-bind("localLineOffset + 'px'");
}
.top::before {
  right: v-bind("offsetToAlignTerminalWithLine + 'px'");
}
.right {
  right: v-bind("localLineOffset + 'px'");
}
.right::before {
  right: v-bind("offsetToAlignTerminalWithLine + 'px'");
}
.bottom {
  bottom: v-bind("localLineOffset + 'px'");
}
.bottom::before {
  right: v-bind("offsetToAlignTerminalWithLine + 'px'");
}
.left {
  left: v-bind("localLineOffset + 'px'");
}
.left::before {
  right: v-bind("offsetToAlignTerminalWithLine + 'px'");
}
</style>
