<script setup lang="ts">
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { useMutation } from '@tanstack/vue-query'
import router from '@/router'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Button from '@/components/ui/button/Button.vue'
import { RouterLink } from 'vue-router'
const schema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'This is required' })
    .email({ message: 'Must be a valid email' }),
  password: zod.string().min(1, { message: 'This is required' }).min(8, { message: 'Too short' })
})
type Schema = zod.infer<typeof schema>
const validationSchema = toTypedSchema(schema)
const { handleSubmit, errors } = useForm({
  validationSchema
})
const { value: email } = useField('email')
const { value: password } = useField('password')
const { isPending, mutateAsync } = useMutation({
  mutationFn: async (values: Schema) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    localStorage.setItem('user', values.email)
  },
  onSuccess: () => {
    router.replace('/')
  }
})
const onSubmit = handleSubmit(async (values) => {
  await mutateAsync(values)
})
</script>

<template>
  <main class="flex justify-center items-center h-full">
    <div class="flex w-fit h-fit justify-stretch items-stretch">
      <form
        @submit="onSubmit"
        class="flex flex-col justify-center items-center w-fit h-fit py-20 px-16 gap-4 shadow-md border"
      >
        <h1 class="text-3xl self-start">Sign in</h1>
        <div class>
          <Label for="email">Email</Label>
          <Input class="h-14 w-full" name="email" v-model="email" type="email" />
          <span>{{ errors.email }}</span>
        </div>
        <div>
          <Label for="password">Password</Label>
          <Input class="h-14" name="password" v-model="password" type="password" />
          <span>{{ errors.password }}</span>
        </div>
        <Button :disabled="isPending">Sign in</Button>
      </form>
      <div
        class="flex flex-col items-center justify-center px-16 py-20 bg-indigo-600 text-white gap-6"
      >
        <h2 class="text-3xl">Welcome to the Trevue</h2>
        <p class="text-sm">Don't have an account?</p>
        <Button :as="RouterLink" to="/register">Sign up</Button>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
