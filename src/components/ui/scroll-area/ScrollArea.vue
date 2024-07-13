<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  type ScrollAreaRootProps,
  ScrollAreaViewport
} from 'radix-vue'
import ScrollBar from './ScrollBar.vue'
import { cn } from '@/lib/utils'
import { omit } from 'lodash'
const props = defineProps<
  ScrollAreaRootProps & {
    class?: HTMLAttributes['class']
    scrollBarClass?: HTMLAttributes['class']
    scrollBarThumbClass?: HTMLAttributes['class']
    scrollBarOrientation?: 'vertical' | 'horizontal'
  }
>()

const delegatedProps = computed(() => {
  return omit(props, ['scrollBarClass', 'scrollBarOrientation', 'class', 'scrollBarThumbClass'])
})
</script>

<template>
  <ScrollAreaRoot v-bind="delegatedProps" :class="cn('relative overflow-hidden', props.class)">
    <ScrollAreaViewport class="h-full w-full rounded-[inherit]">
      <slot />
    </ScrollAreaViewport>
    <ScrollBar
      :class="props.scrollBarClass"
      :orientation="props.scrollBarOrientation"
      :thumb-class="props.scrollBarThumbClass"
    />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
