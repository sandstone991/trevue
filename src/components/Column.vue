<script setup lang="ts">
import type { Column } from '@/interface'
import Card from './Card.vue'
import { ref, watchEffect } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useBoardStore } from '@/stores/board'
import Button from './ui/button/Button.vue'
import Textarea from './ui/textarea/Textarea.vue'
const props = defineProps<{ column: Column }>()
const boards = useBoardStore()
const isInCreationDialog = ref(false)
const newCardName = ref('')
const newCardInput = ref<HTMLInputElement | null>(null)
const newCardDialog = ref<HTMLElement | null>(null)
watchEffect(() => {
  if (isInCreationDialog.value) {
    newCardInput.value?.focus()
  }
})
function handleNewCard() {
  if (!newCardName.value) return exitDialog()
  boards.addCard(props.column.id, newCardName.value)
  clearNewCard()
}

function clearNewCard() {
  newCardName.value = ''
}
function exitDialog() {
  console.log('exit')
  clearNewCard()
  isInCreationDialog.value = false
}
onClickOutside(newCardDialog, () => {
  handleNewCard()
  exitDialog()
})
</script>
<template>
  <div class="bg-stone-900 text-white w-[272px] rounded-md shadow-md h-fit">
    <div
      class="flex items-center gap-2 overflow-hidden cursor-pointer px-4 py-2"
      style="overflow-wrap: anywhere"
    >
      <span class="text-lg font-semibold">{{ column.title }}</span>
    </div>
    <div class="flex flex-col items-center gap-2 w-full px-2 py-2">
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
    </div>
  </div>
</template>
<style scoped></style>
