// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'Vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import 'animate.css'

const vuetify = createVuetify()

createApp(App).use(vuetify).mount('#app')
