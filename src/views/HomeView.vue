<script setup lang="ts">
import { useBoardStore } from '@/stores/board'
import { ref, watchEffect } from 'vue'
import { onClickOutside } from '@vueuse/core'
import ScrollArea from '@/components/ui/scroll-area/ScrollArea.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Column from '@/components/Column.vue'
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
</script>

<template>
  <div class="h-full w-full flex flex-col">
    <header class="w-full h-10 bg-stone-400"></header>
    <div class="w-full h-full overflow-auto">
      <ScrollArea
        class="bg-stone-200 w-full h-full flex gap-10 whitespace-nowrap"
        scroll-bar-orientation="horizontal"
        scroll-bar-class="bg-stone-300"
        scroll-bar-thumb-class="bg-stone-400"
      >
        <main class="bg-stone-200 h-full w-full p-8 flex gap-10">
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
            class="flex flex-col gap-2 bg-stone-700 text-white w-[272px] rounded-md shadow-md px-2 py-2"
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
      </ScrollArea>
    </div>
  </div>
</template>
