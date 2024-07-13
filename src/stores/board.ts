import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Column, Card } from '@/interface'


export const useBoardStore = defineStore('board', () => {
  const columns = ref<Column[]>([])
  const idToColumnMap = computed(() => {
    return columns.value.reduce(
      (acc, board) => {
        acc[board.id] = { board: board, index: columns.value.indexOf(board) }
        return acc
      },
      {} as Record<
        string,
        {
          board: Column
          index: number
        }
      >
    )
  })
  function getColumn(id:string){
    return idToColumnMap.value[id].board
  }
  function getColumnIndex(id:string){
    return idToColumnMap.value[id].index
  }
  function swapColumns(boardId1: string, boardId2: string) {
    const index1 = getColumnIndex(boardId1)
    const index2 = getColumnIndex(boardId2)
    const temp = columns.value[index1]
    columns.value[index1] = columns.value[index2]
    columns.value[index2] = temp
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
    function swapCards(boardId: string, cardId1: string, cardId2: string) {
        const board = getColumn(boardId)
        const index1 = board.cards.findIndex((card) => card.id === cardId1)
        const index2 = board.cards.findIndex((card) => card.id === cardId2)
        const temp = board.cards[index1]
        board.cards[index1] = board.cards[index2]
        board.cards[index2] = temp
    }
    function addColumn(boardName: string){
        const newColumn: Column = {
            id: Date.now().toString(),
            title: boardName,
            cards: []
        }
        _addColumn(newColumn)
    }
    function addCard(boardId: string, cardTitle: string, cardDescription: string = "", cardLabels: string[] = []){
        const newCard: Card = {
            id: Date.now().toString(),
            title: cardTitle,
            description: cardDescription,
            labels: cardLabels
        }
        _addCard(boardId, newCard)
    }
    const isEmpty = computed(() => columns.value.length === 0)
    return {
        columns,
        idToColumnMap,
        getColumn,
        getColumnIndex,
        swapColumns,
        addColumn,
        removeColumn,
        addCard,
        removeCard,
        swapCards,
        isEmpty
    }
})
