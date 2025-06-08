<template>
  <div>
    <p>{{ nome }} - {{ senha }}</p>
    <p><input type="text" :value="nome" /></p>
    <p><input type="text" v-model="nome" /></p>
    <p><input type="password" v-model="senha" /></p>
    <p v-if="senha.length < 5 && senha.length > 0">Senha muito curta</p>
    <p v-else>Senha ok!</p>
    <p v-if="erro">{{ erro }}</p>
    <p v-if="store.token">{{ store.token }}</p>
    <button @click="atualizar">Atualizar</button>
    <button @click="incluir">Incluir</button>
    <table>
      <thead>
        <tr>
          <td>Id</td>
          <td>Nome</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(usuario, index) in usuarios" :key="index">
          <td>{{ usuario.id }}</td>
          <td>{{ usuario.nome }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { onMounted } from 'vue'
import { loginStore } from '@/stores/login'

const store = loginStore()

const nome = ref<string>('')
const senha = ref<string>('')
const erro = ref<string>('')

interface usuario {
  id?: number
  nome: string
  senha: string
}

const usuarios = ref<usuario[]>([
  { id: 1, nome: 'admin', senha: '123' },
  { id: 2, nome: 'teste', senha: 'abc' },
])

async function atualizar() {
  try {
    usuarios.value = (await axios.get('usuario')).data
    erro.value = ''
  } catch (e) {
    erro.value = (e as Error).message
  }
}

async function incluir() {
  try {
    await axios.post('usuario', {
      nome: nome.value,
      senha: senha.value,
    })
    erro.value = ''
    nome.value = ''
    senha.value = ''
    atualizar()
  } catch (e) {
    erro.value = (e as Error).message
  }
}

onMounted(() => {
  atualizar()
})
</script>
