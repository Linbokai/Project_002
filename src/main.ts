import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import { useTheme } from '@/composables/use-theme'
import App from './App.vue'
import '@/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const { init: initTheme } = useTheme()
initTheme()

app.mount('#app')
