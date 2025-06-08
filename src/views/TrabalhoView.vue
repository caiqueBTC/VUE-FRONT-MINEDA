<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

interface Trabalho {
  id: number
  titulo: string
  dataHoraEntrega: string | null
  descricao: string
  grupo: string
  nota: number | null
  justificativa: string
}

const trabalhos = ref<Trabalho[]>([])
const novoTrabalho = ref<Omit<Trabalho, 'id'>>({
  titulo: '',
  dataHoraEntrega: null,
  descricao: '',
  grupo: '',
  nota: null,
  justificativa: ''
})
const termoBuscaTitulo = ref('')
const termoBuscaNota = ref<number | null>(null)
const mensagemErro = ref('')
const mensagemNenhumTrabalho = ref('')

const calcularSituacao = (dataEntrega: string | null): string => {
  if (!dataEntrega) {
    return 'Pendente'
  }
  const dataEntregaObj = new Date(dataEntrega)
  const hoje = new Date()
  const diffTime = hoje.getTime() - dataEntregaObj.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `A entregar em ${Math.abs(diffDays)} dia(s)`
  }
  return `Entregue há ${diffDays} dia(s)`
}

const buscarTodosTrabalhos = async () => {
  try {
    const response = await axios.get('/trabalho')
    trabalhos.value = response.data
    mensagemNenhumTrabalho.value = ''
  } catch (error) {
    console.error('Erro ao buscar trabalhos:', error)
    mensagemErro.value = 'Falha ao carregar os trabalhos.'
  }
}

const validarNovoTrabalho = (): boolean => {
  if (!novoTrabalho.value.titulo || !novoTrabalho.value.grupo) {
    mensagemErro.value = 'Título e Grupo são campos obrigatórios.'
    return false
  }
  mensagemErro.value = ''
  return true
}

const limparFormulario = () => {
  novoTrabalho.value = {
    titulo: '',
    dataHoraEntrega: null,
    descricao: '',
    grupo: '',
    nota: null,
    justificativa: ''
  }
}

const cadastrarTrabalho = async () => {
  if (!validarNovoTrabalho()) {
    return
  }

  const grupoExistente = trabalhos.value.some(
    (t) => t.grupo.toLowerCase() === novoTrabalho.value.grupo.toLowerCase()
  )
  if (grupoExistente) {
    if (!confirm('Já existe um trabalho para este grupo. Deseja continuar?')) {
      return
    }
  }

  try {
    await axios.post('/trabalho', novoTrabalho.value)
    limparFormulario()
    await buscarTodosTrabalhos()
  } catch (error) {
    console.error('Erro ao cadastrar trabalho:', error)
    mensagemErro.value = 'Falha ao cadastrar o trabalho.'
  }
}

const buscarTrabalhos = async () => {
  if (!termoBuscaTitulo.value || termoBuscaNota.value === null) {
    mensagemErro.value = 'Por favor, preencha o título e a nota para a busca.'
    return
  }
  mensagemErro.value = ''
  try {
    const response = await axios.get(`/trabalho/${termoBuscaTitulo.value}/${termoBuscaNota.value}`)
    if (response.data.length === 0) {
      trabalhos.value = []
      mensagemNenhumTrabalho.value = 'Nenhum trabalho foi encontrado para os critérios fornecidos.'
    } else {
      trabalhos.value = response.data
      mensagemNenhumTrabalho.value = ''
    }
  } catch (error) {
    console.error('Erro ao buscar trabalhos:', error)
    mensagemErro.value = 'Falha ao realizar a busca.'
  }
}

const dataHoraEntregaFormatada = computed({
    get: () => {
        if (!novoTrabalho.value.dataHoraEntrega) return '';
        const d = new Date(novoTrabalho.value.dataHoraEntrega);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    },
    set: (value: string) => {
        novoTrabalho.value.dataHoraEntrega = value ? new Date(value).toISOString() : null;
    }
});

onMounted(() => {
  buscarTodosTrabalhos()
})
</script>

<template>
  <main class="trabalho-container">
    <h1>Gerenciar Trabalhos</h1>

    <section class="card">
      <h2>Cadastrar Novo Trabalho</h2>
      <form @submit.prevent="cadastrarTrabalho">
        <div class="form-grid">
          <div class="form-group">
            <label for="titulo">Título *</label>
            <input id="titulo" v-model="novoTrabalho.titulo" type="text" placeholder="Título do trabalho" />
          </div>
          <div class="form-group">
            <label for="grupo">Grupo *</label>
            <input id="grupo" v-model="novoTrabalho.grupo" type="text" placeholder="Nome do grupo" />
          </div>
          <div class="form-group">
            <label for="dataHoraEntrega">Data e Hora de Entrega</label>
            <input id="dataHoraEntrega" v-model="dataHoraEntregaFormatada" type="datetime-local" />
          </div>
          <div class="form-group">
            <label for="nota">Nota</label>
            <input id="nota" v-model.number="novoTrabalho.nota" type="number" placeholder="Nota" />
          </div>
        </div>
        <div class="form-group">
          <label for="descricao">Descrição</label>
          <textarea id="descricao" v-model="novoTrabalho.descricao" placeholder="Descrição do trabalho"></textarea>
        </div>
        <div class="form-group">
          <label for="justificativa">Justificativa</label>
          <textarea id="justificativa" v-model="novoTrabalho.justificativa" placeholder="Justificativa da nota"></textarea>
        </div>
        <button type="submit">Cadastrar</button>
      </form>
      <p v-if="mensagemErro" class="error-message">{{ mensagemErro }}</p>
    </section>

    <section class="card">
      <h2>Consultar Trabalhos</h2>
      <form @submit.prevent="buscarTrabalhos">
        <div class="form-grid">
          <div class="form-group">
            <label for="buscaTitulo">Título</label>
            <input id="buscaTitulo" v-model="termoBuscaTitulo" type="text" placeholder="Parte do título" />
          </div>
          <div class="form-group">
            <label for="buscaNota">Nota Maior que</label>
            <input id="buscaNota" v-model.number="termoBuscaNota" type="number" placeholder="Nota" />
          </div>
        </div>
        <div class="button-group">
            <button type="submit">Consultar</button>
            <button type="button" @click="buscarTodosTrabalhos">Limpar Busca</button>
        </div>
      </form>
    </section>

    <section class="card">
      <h2>Lista de Trabalhos</h2>
      <div v-if="mensagemNenhumTrabalho" class="info-message">
        {{ mensagemNenhumTrabalho }}
      </div>
      <table v-else-if="trabalhos.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Grupo</th>
            <th>Nota</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="trabalho in trabalhos" :key="trabalho.id">
            <td>{{ trabalho.id }}</td>
            <td>{{ trabalho.titulo }}</td>
            <td>{{ trabalho.grupo }}</td>
            <td>{{ trabalho.nota ?? 'N/A' }}</td>
            <td>{{ calcularSituacao(trabalho.dataHoraEntrega) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="info-message">Nenhum trabalho cadastrado.</p>
    </section>
  </main>
</template>

<style scoped>
.trabalho-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card {
  background-color: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--color-heading);
}

input[type='text'],
input[type='number'],
input[type='datetime-local'],
textarea {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background);
  color: var(--color-text);
  width: 100%;
}

textarea {
  min-height: 80px;
  resize: vertical;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: bold;
}

button:hover {
  background-color: hsla(160, 100%, 30%, 1);
}

.button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.error-message {
  color: #e53e3e;
  margin-top: 1rem;
}

.info-message {
  color: var(--color-text);
  margin-top: 1rem;
  text-align: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

th {
  background-color: var(--color-background-mute);
  font-weight: bold;
}

tbody tr:hover {
  background-color: var(--color-background-mute);
}
</style>
