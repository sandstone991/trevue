import type { useBoardStore } from "@/stores/board"
import * as liveRegion from "@atlaskit/pragmatic-drag-and-drop-live-region"
import { watch, onUnmounted } from "vue"
export const usePostDndEffects = (boards: ReturnType<typeof useBoardStore>)=>{
    
watch(
    // @ts-ignore
    boards.lastDNDOperation,
    () => {
      if (boards.lastDNDOperation === null) {
        return
      }
      const { outcome, trigger } = boards.lastDNDOperation
      if (trigger !== 'keyboard') {
        return
      }
      if (outcome.type === 'column-reorder') {
        const { startIndex, finishIndex } = outcome
        const sortedColumns = boards.columnIds
        const columnsMap = boards.idToColumnMap
        const sourceColumn = columnsMap[sortedColumns[startIndex]]
        liveRegion.announce(
          `You've moved ${sourceColumn.column.title} from position ${
            startIndex + 1
          } to position ${finishIndex + 1} of ${sortedColumns.length}.`
        )
        //todo make item flash
        return
      }
      if (outcome.type === 'card-reorder') {
        const { columnId, startIndex, finishIndex } = outcome
        const columnsMap = boards.idToColumnMap
        const column = columnsMap[columnId]
        const card = column.column.cards[finishIndex]
        liveRegion.announce(
          `You've moved ${card.title} from position ${startIndex + 1} to position ${finishIndex + 1} of ${column.column.cards.length}.`
        )
        // flash card
        return
      }
      if (outcome.type === 'card-move') {
        const { finishColumnId, itemIndexInStartColumn, itemIndexInFinishColumn } = outcome
        const destinationColumn = boards.idToColumnMap[finishColumnId]
        const card = destinationColumn.column.cards[itemIndexInFinishColumn]
        const finishPosition =
          typeof itemIndexInFinishColumn === 'number'
            ? itemIndexInFinishColumn + 1
            : destinationColumn.column.cards.length
        // flash card
        liveRegion.announce(
          `You've moved ${card.title} from position ${
            itemIndexInStartColumn + 1
          } to position ${finishPosition} in the ${destinationColumn.column.cards} column.`
        )
      }
    },
    {
      immediate: true
    }
  )
  onUnmounted(()=>{
    liveRegion.cleanup()
  })
}