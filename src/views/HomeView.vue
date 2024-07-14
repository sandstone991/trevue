<script setup lang="ts">
import { useBoardStore } from '@/stores/board'
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { onClickOutside } from '@vueuse/core'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Column from '@/components/Column.vue'
import { usePostDndEffects } from '@/composables/dnd/usePostEffects'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'

const boards = useBoardStore()
const isInCreationDialog = ref(false)
const newColumnName = ref('')
const newColumnInput = ref<HTMLInputElement | null>(null)
const newColumnDialog = ref<HTMLElement | null>(null)
watchEffect(() => {
  if (isInCreationDialog.value) {
    newColumnInput.value?.focus()
  }
})
function handleNewColumn() {
  if (!newColumnName.value) return clearNewColumn()
  boards.addColumn(newColumnName.value)
  clearNewColumn()
}

function clearNewColumn() {
  isInCreationDialog.value = false
  newColumnName.value = ''
}
onClickOutside(newColumnDialog, () => {
  clearNewColumn()
})
usePostDndEffects(boards)
const cleanup = ref<() => void>(() => () => {})
onMounted(() => {
  const dispose = combine(
    monitorForElements({
      canMonitor: () => true,
      onDrop: (args) => {
        const { location, source } = args
        if (!location.current.dropTargets.length) return
        if (source.data.type === 'column') {
          const startIndex = boards.idToColumnMap[source.data.columnId as string].index
          const target = location.current.dropTargets[0]
          const indexOfTarget = boards.idToColumnMap[target.data.columnId as string].index
          const closestEdgeOfTarget = extractClosestEdge(target.data)
          const finishIndex = getReorderDestinationIndex({
            startIndex,
            indexOfTarget,
            closestEdgeOfTarget,
            axis: 'horizontal'
          })
          boards.reorderColumn(startIndex, finishIndex)
          boards.setLastDndOperation({
            trigger: 'pointer',
            outcome: {
              type: 'column-reorder',
              columnId: source.data.columnId as string,
              startIndex,
              finishIndex
            }
          })
        } else if (source.data.type === 'card') {
          const cardId = source.data.cardId as string
          const columnId = source.data.columnId as string
          const sourceColumn = boards.idToColumnMap[columnId].column
          const cardIndex = sourceColumn.cards.findIndex((card) => card.id === cardId)
          const [destenation] = location.current.dropTargets
          const destenationCardId = destenation.data.cardId as string
          const destenationColumnId = destenation.data.columnId as string
          const destenationIndex = boards.idToColumnMap[destenationColumnId].column.cards.findIndex(
            (card) => card.id === destenationCardId
          )

          if (columnId === destenationColumnId) {
            const finishIndex = getReorderDestinationIndex({
              axis: 'vertical',
              closestEdgeOfTarget: null,
              indexOfTarget: destenationIndex,
              startIndex: cardIndex
            })
            boards.reorderCard(columnId, cardIndex, finishIndex)
            boards.setLastDndOperation({
              trigger: 'pointer',
              outcome: {
                type: 'card-reorder',
                columnId,
                startIndex: cardIndex,
                finishIndex,
                cardId: cardId
              }
            })
            return
          }
          const closestEdgeOfTarget = extractClosestEdge(destenation.data)
          boards.moveCard({
            startColumnId: columnId,
            finishColumnId: destenationColumnId,
            itemIndexInStartColumn: cardIndex,
            itemIndexInFinishColumn:
              closestEdgeOfTarget === 'bottom' ? destenationIndex + 1 : destenationIndex
          })
          boards.setLastDndOperation({
            trigger: 'pointer',
            outcome: {
              type: 'card-move',
              finishColumnId: destenationColumnId,
              itemIndexInFinishColumn:
                closestEdgeOfTarget === 'bottom' ? destenationIndex + 1 : destenationIndex,
              itemIndexInStartColumn: cardIndex,
              cardId: cardId
            }
          })
        }
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
  <div class="h-full w-full flex flex-col grow">
    <header class="w-full h-10 bg-stone-400"></header>
    <div
      class="w-full h-full overflow-y-hidden overflow-x-auto bg-stone-200"
      style="scrollbar-width: thin"
    >
      <main class="h-full max-h-full w-full p-8 flex gap-10">
        <Column v-for="column in boards.columns" :key="column.id" :column="column" />
        <div
          v-if="!isInCreationDialog"
          @click="isInCreationDialog = true"
          class="flex items-center gap-2 w-fit p-3 px-5 rounded-md bg-white/50 shadow-md text-black cursor-pointer select-none h-fit"
        >
          <span class="icon-[ic--baseline-plus] h-4 w-4"></span>
          <Button v-if="boards.isEmpty" variant="ghost"> Add a board </Button>
          <Button v-else variant="ghost"> Add another board </Button>
        </div>
        <div
          v-if="isInCreationDialog"
          class="flex flex-col gap-2 bg-stone-700 text-white w-[272px] rounded-md shadow-md px-2 py-2 h-fit"
          ref="newColumnDialog"
        >
          <Input
            type="text"
            placeholder="Board name"
            class="text-black"
            ref="newColumnInput"
            v-model="newColumnName"
            @blur="handleNewColumn()"
            @keypress.enter="handleNewColumn()"
            @keydown.esc="clearNewColumn()"
          />
          <div class="flex gap-2">
            <Button @click="handleNewColumn()"> Create </Button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
