<template>
  <div>
    <p>Nome: <input type="text" v-model="store.nome" /></p>
    <p>Senha: <input type="password" v-model="store.senha" /></p>
    <button @click="store.login">Ok</button>
    <p>{{ store.token }}</p>
    <p v-if="store.erro">{{ store.erro }}</p>
  </div>
</template>

<script setup lang="ts">
import { loginStore } from '@/stores/login'

const store = loginStore()
</script>
