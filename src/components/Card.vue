<script setup lang="ts">
import type { Card } from '@/interface'
defineProps<{ card: Card }>()
</script>

<template>
  <li class="flex items-center gap-1 w-full bg-stone-600 rounded-md py-1 px-2 min-h-9">
    <span class="overflow-hidden whitespace-normal break-words">{{ card.title }}</span>
  </li>
</template>

<style scoped></style>
