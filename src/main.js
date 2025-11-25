import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/style/main.scss'
import 'bootstrap-icons/font/bootstrap-icons.css'

import App from './App.vue'
import router from './router'
import BaseAlert from './components/BaseAlert.vue'

const app = createApp(App)

// 掛載全域 Alert 元件
const container = document.createElement('div');
document.body.appendChild(container);
createApp(BaseAlert).mount(container);

app.use(createPinia())
app.use(router)

app.mount('#app')
