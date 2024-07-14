<script setup lang="ts">
import { type ColumnDNDState, type Column } from '@/interface'
import invariant from 'tiny-invariant'

import Card from './Card.vue'
import { nextTick, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useBoardStore } from '@/stores/board'
import Button from './ui/button/Button.vue'
import Textarea from './ui/textarea/Textarea.vue'
import {
  attachClosestEdge,
  extractClosestEdge
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'

import DropIndicator from './DropIndicator.vue'
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element'

import { cn } from '@/lib/utils'
const props = defineProps<{ column: Column }>()
const boards = useBoardStore()
const isInCreationDialog = ref(false)
const newCardName = ref('')
const newCardInput = ref<HTMLInputElement | null>(null)
const newCardDialog = ref<HTMLElement | null>(null)
const scrollableRef = ref<HTMLElement | null>(null)
watchEffect(() => {
  if (isInCreationDialog.value) {
    newCardInput.value?.focus()
  }
})
function handleNewCard() {
  if (!newCardName.value) return exitDialog()
  boards.addCard(props.column.id, newCardName.value)
  nextTick(() => {
    scrollableRef.value?.scrollTo({ top: scrollableRef.value!.scrollHeight, behavior: 'instant' })
  })
  clearNewCard()
}

function clearNewCard() {
  newCardName.value = ''
}
function exitDialog() {
  clearNewCard()
  isInCreationDialog.value = false
}
onClickOutside(newCardDialog, () => {
  handleNewCard()
  exitDialog()
})

const dndState = ref<ColumnDNDState>({
  type: 'idle'
})
const columnRef = ref<HTMLElement | null>(null)
const cleanup = ref<() => void>(() => () => {})
const isDragging = ref(false)

function useSetDom() {
  onMounted(() => {
    invariant(columnRef)
    boards.setColumnDom(props.column.id, columnRef.value!)
  })
  onUnmounted(() => {
    boards.removeColumnDom(props.column.id)
  })
}

useSetDom()
onMounted(() => {
  invariant(columnRef)
  const dispose = combine(
    draggable({
      element: columnRef.value!,
      getInitialData: () => ({ columnId: props.column.id, type: 'column' }),
      onDragStart: () => {
        isDragging.value = true
      },
      onDrop: () => {
        dndState.value = { type: 'idle' }
        isDragging.value = false
      }
    }),
    dropTargetForElements({
      element: columnRef.value!,
      canDrop: ({ source }) => {
        return source.data.type === 'column'
      },
      getIsSticky: () => true,
      getData: ({ input, element }) => {
        const data = { columnId: props.column.id }
        return attachClosestEdge(data, {
          input,
          element,
          allowedEdges: ['left', 'right']
        })
      },
      onDragEnter: (args) => {
        dndState.value = {
          type: 'is-column-over',
          closestEdge: extractClosestEdge(args)
        }
      },
      onDrag: (args) => {
        const closestEdge = extractClosestEdge(args.self.data)
        if (
          dndState.value.type === 'is-column-over' &&
          dndState.value.closestEdge === closestEdge
        ) {
          return
        }
        dndState.value = {
          type: 'is-column-over',
          closestEdge
        }
      },
      onDragLeave: () => {
        dndState.value = { type: 'idle' }
      },
      onDrop: () => {
        dndState.value = { type: 'idle' }
      }
    }),
    autoScrollForElements({
      element: scrollableRef.value!,
      canScroll: (args) => {
        return args.source.data.type === 'card'
      }
    })
  )

  cleanup.value = dispose
})

onUnmounted(() => {
  cleanup.value()
})
</script>
<template>
  <div class="w-fit h-full max-h-full flex relative" ref="columnRef">
    <div
      :class="
        cn(
          'bg-stone-900 text-white w-[272px] h-fit max-h-full rounded-md shadow-md flex flex-col transition-all',
          {
            'opacity-50': isDragging
          },
          {
            'bg-indigo-400 border-blue-500 border-2': dndState.type === 'is-card-over'
          }
        )
      "
    >
      <div
        class="flex items-center gap-2 overflow-hidden cursor-pointer px-4 py-2"
        style="overflow-wrap: anywhere"
      >
        <span class="text-lg font-semibold">{{ column.title }}</span>
      </div>
      <ol
        class="w-full h-full max-h-full overflow-auto px-2 py-2 space-y-3"
        style="scrollbar-width: thin"
        ref="scrollableRef"
      >
        <Card v-for="card in column.cards" :key="card.id" :card="card" />
        <Button
          :as="'div'"
          variant="ghost"
          v-if="!isInCreationDialog"
          @click="isInCreationDialog = true"
          class="flex items-center gap-2 w-fit p-3 px-5 rounded-md bg-white/50 shadow-md text-black cursor-pointer select-none self-start text-sm"
        >
          <span class="icon-[ic--baseline-plus] h-4 w-4"></span>
          <span class="text-sm">Add a card</span>
        </Button>
        <div
          v-if="isInCreationDialog"
          class="flex flex-col gap-2 bg-stone-700 text-white w-full rounded-md shadow-md px-2 py-2"
          ref="newCardDialog"
        >
          <Textarea
            v-model="newCardName"
            ref="newCardInput"
            @keydown.esc="exitDialog()"
            @keypress.enter.prevent="handleNewCard()"
            @blur="
              () => {
                handleNewCard()
                exitDialog()
              }
            "
            class="bg-stone-800 text-white w-full rounded-md px-2 py-1"
            placeholder="Enter a title for this card..."
          />
        </div>
      </ol>
    </div>
    <DropIndicator
      v-if="dndState.type === 'is-column-over' && !!dndState.closestEdge"
      :edge="dndState.closestEdge!"
    />
  </div>
</template>
<style scoped></style>
