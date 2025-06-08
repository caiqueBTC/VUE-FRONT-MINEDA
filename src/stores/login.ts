import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const loginStore = defineStore(
  'login',
  () => {
    const nome = ref<string>('')
    const senha = ref<string>('')
    const token = ref<string>()
    const erro = ref<string>('')

    async function login() {
      try {
        token.value = (
          await axios.post('login', {
            username: nome.value,
            password: senha.value,
          })
        ).data.token
        erro.value = ''
        nome.value = ''
        senha.value = ''
      } catch (e) {
        erro.value = (e as Error).message
        token.value = ''
      }
    }
    return { nome, senha, token, erro, login }
  },
  {
    persist: true,
  },
)
