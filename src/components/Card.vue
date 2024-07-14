<script setup lang="ts">
import type { Card } from '@/interface'
import { onMounted, onUnmounted, ref } from 'vue'
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'

import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'

import invariant from 'tiny-invariant'
import { useBoardStore } from '@/stores/board'
import DropIndicator from './DropIndicator.vue'
const props = defineProps<{ card: Card }>()
const emit = defineEmits(['overCard', 'leaveCard'])
const boards = useBoardStore()
const cardRef = ref<HTMLDListElement | null>(null)
type DNDState = { type: 'idle' } | { type: 'dragging' } | { type: 'preview' }
const closestEdge = ref<Edge | null>(null)
const dndState = ref<DNDState>({ type: 'idle' })
function useSetDom() {
  onMounted(() => {
    invariant(cardRef)
    boards.setCardDom(props.card.id, cardRef.value!)
  })
  onUnmounted(() => {
    boards.removeCardDom(props.card.id)
  })
}
useSetDom()
const cleanup = ref<() => void>(() => () => {})
onMounted(() => {
  invariant(cardRef.value)
  cleanup.value = combine(
    draggable({
      element: cardRef.value!,
      getInitialData: () => ({
        type: 'card',
        cardId: props.card.id,
        columnId: props.card.parentColumnId
      }),
      onDragStart: () => {
        dndState.value = { type: 'dragging' }
      },
      onDrop: () => {
        dndState.value = { type: 'idle' }
      }
    }),
    dropTargetForElements({
      element: cardRef.value!,
      canDrop: (args) => {
        const { source } = args
        return source.data.type === 'card'
      },
      getIsSticky: () => true,
      getData: ({ input, element }) => {
        const data = { type: 'card', cardId: props.card.id, columnId: props.card.parentColumnId }
        return attachClosestEdge(data, {
          input,
          element,
          allowedEdges: ['top', 'bottom']
        })
      },
      onDragEnter: (args) => {
        if (args.source.data.cardId !== props.card.id) {
          closestEdge.value = extractClosestEdge(args.self.data)
        }
        emit('overCard')
      },
      onDrag: (args) => {
        if (args.source.data.cardId !== props.card.id) {
          closestEdge.value = extractClosestEdge(args.self.data)
        }
      },
      onDragLeave: () => {
        closestEdge.value = null
        emit('leaveCard')
      },
      onDrop: () => {
        closestEdge.value = null
        emit('leaveCard')
      }
    })
  )
})
onUnmounted(() => {
  cleanup.value()
})
</script>

<template>
  <li class="w-full h-fit relative">
    <div
      ref="cardRef"
      class="flex relative items-center w-full bg-stone-600 rounded-md py-2 px-2 shadow-sm min-h-9"
    >
      <span class="overflow-hidden whitespace-normal break-words">{{ card.title }}</span>
    </div>
    <DropIndicator v-if="closestEdge" :edge="closestEdge" :gap="5" />
  </li>
</template>

<style scoped></style>
