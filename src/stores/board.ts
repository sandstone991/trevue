import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { type Column, type Card, type Operation } from '@/interface'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

import {nanoid} from 'nanoid'
export const useBoardStore = defineStore('board', () => {
  const columns = ref<Column[]>([])
  const columnIds = computed(() => columns.value.map((column) => column.id))
  const lastDNDOperation = ref<Operation | null>(null);
  const columnIdsToDom = ref<Record<string, HTMLElement | null>>({});
  const cardIdsToDom = ref<Record<string, HTMLElement | null>>({});
  function setCardDom(cardId: string, dom: HTMLElement | null) {
    cardIdsToDom.value[cardId] = dom
  }
  function removeCardDom(cardId: string) {
    delete cardIdsToDom.value[cardId]
  }
  function setColumnDom(columnId: string, dom: HTMLElement | null) {
    columnIdsToDom.value[columnId] = dom
  }
  function removeColumnDom(columnId: string) {
    delete columnIdsToDom.value[columnId]
  }
  function setLastDndOperation(operation: Operation) {
    lastDNDOperation.value = operation
  }
  const idToColumnMap = computed(() => {
    return columns.value.reduce(
      (acc, board) => {
        acc[board.id] = { column: board, index: columns.value.indexOf(board) }
        return acc
      },
      {} as Record<
        string,
        {
          column: Column
          index: number
        }
      >
    )
  })

  function reorderColumn(startIndex: number, finishIndex: number) {
    columns.value = reorder({
      list: columns.value,
      startIndex,
      finishIndex
      });
  }
  function reorderCard(columnId: string, startIndex: number, finishIndex: number) {
    const column = getColumn(columnId)
    column.cards = reorder({
      list: column.cards,
      startIndex,
      finishIndex
    })
  }
  function getColumn(id:string){
    return idToColumnMap.value[id].column
  }
  function getColumnIndex(id:string){
    return idToColumnMap.value[id].index
  }
  
    function _addColumn(board: Column) {
        columns.value.push(board)
    }
    function removeColumn(boardId: string) {
        const index = getColumnIndex(boardId)
        columns.value.splice(index, 1)
    }
    function _addCard(boardId: string, card: Card) {
        const board = getColumn(boardId)
        board.cards.push(card)
    }
    function removeCard(boardId: string, cardId: string) {
        const board = getColumn(boardId)
        const index = board.cards.findIndex((card) => card.id === cardId)
        board.cards.splice(index, 1)
    }

    function addColumn(boardName: string){
        const newColumn: Column = {
            id: nanoid(),
            title: boardName,
            cards: []
        }
        _addColumn(newColumn)
    }
    function addCard(columnId: string, cardTitle: string, cardDescription: string = "", cardLabels: string[] = []){
        const newCard: Card = {
            id: nanoid(),
            title: cardTitle,
            description: cardDescription,
            labels: cardLabels,
            parentColumnId: columnId
        }
        _addCard(columnId, newCard)
    }
    function moveCard	({
			startColumnId,
			finishColumnId,
			itemIndexInStartColumn,
			itemIndexInFinishColumn,
		}: {
			startColumnId: string;
			finishColumnId: string;
			itemIndexInStartColumn: number;
			itemIndexInFinishColumn?: number;
		}){
        const card = getColumn(startColumnId).cards[itemIndexInStartColumn]
        const startColumn = getColumn(startColumnId)
        const finishColumn = getColumn(finishColumnId)
        startColumn.cards.splice(itemIndexInStartColumn, 1)
        if (typeof itemIndexInFinishColumn === 'number') {
            finishColumn.cards.splice(itemIndexInFinishColumn, 0, card)
        } else {
            finishColumn.cards.push(card)
        }
        card.parentColumnId = finishColumnId
    }
    const isEmpty = computed(() => columns.value.length === 0);
    
    return {
        columns,
        idToColumnMap,
        getColumn,
        getColumnIndex,
        addColumn,
        removeColumn,
        addCard,
        removeCard,
        isEmpty,
        lastDNDOperation,
        columnIds,
        reorderColumn,
        reorderCard,
        moveCard,
        setColumnDom,
        removeColumnDom,
        columnIdsToDom,
        setLastDndOperation,
        setCardDom,
        removeCardDom,
        cardIdsToDom,

    } 
})
