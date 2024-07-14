import type { useBoardStore } from "@/stores/board"
import * as liveRegion from "@atlaskit/pragmatic-drag-and-drop-live-region"
import { values } from "lodash"
import { watch, onUnmounted, nextTick, unref } from "vue"
export const usePostDndEffects = (boards: ReturnType<typeof useBoardStore>)=>{
watch(
    ()=>boards.lastDNDOperation,
    () => {
      if (boards.lastDNDOperation === null) {
        return
      }
      const { outcome } = boards.lastDNDOperation
     
      if (outcome.type === 'column-reorder') {
        const { startIndex, finishIndex } = outcome
        const sortedColumns = boards.columnIds
        const columnsMap = boards.idToColumnMap
        const sourceColumn = columnsMap[sortedColumns[startIndex]]
        const destinationColumn = columnsMap[sortedColumns[finishIndex]]
        liveRegion.announce(
          `You've moved ${sourceColumn.column.title} from position ${
            startIndex + 1
          } to position ${finishIndex + 1} of ${sortedColumns.length}.`
        )
        const columnDom = boards.columnIdsToDom[destinationColumn.column.id];
        columnDom?.focus();
        columnDom?.animate( [{
          opacity: 0.5, offset: .3, easing: "ease-in"
        }, {
          opacity: 1, offset: 1, easing: "ease-out"
        }], {
          delay: 0,
          duration: 300,
          iterations:1,

        }).play()
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
        const cardDom = boards.cardIdsToDom[outcome.cardId];
        cardDom?.focus();
        cardDom?.animate([
          {
            backgroundColor: 'pink',
            offset: 0.3,
          }
        ], {
          delay: 0,
          duration: 300,
          iterations:1,

        }).play()
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
        nextTick(() => {
        const cardDom = boards.cardIdsToDom[outcome.cardId];
        cardDom?.focus();
        cardDom?.animate([
          {
            backgroundColor: 'pink',
            offset: 0.3,
          }
        ], {
          delay: 0,
          duration: 300,
          iterations:1,

        }).play()
      })
      }
    },{
      flush: 'post'
    }
  )
  onUnmounted(()=>{
    liveRegion.cleanup()
  })
}