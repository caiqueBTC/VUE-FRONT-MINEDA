import './assets/main.css'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import axios from 'axios'
import { loginStore } from './stores/login'

axios.defaults.baseURL = 'http://localhost:8081/'

axios.interceptors.request.use((config) => {
  const store = loginStore()
  if (store.token) {
    config.headers.Authorization = store.token
  }
  return config
})

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')
