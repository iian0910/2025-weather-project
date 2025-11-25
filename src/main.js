import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/style/main.scss'
import 'bootstrap-icons/font/bootstrap-icons.css'

import App from './App.vue'
import router from './router'
import BaseAlert from './components/BaseAlert.vue'
import BaseLoading from './components/BaseLoading.vue'

const app = createApp(App)

// 掛載全域 Alert 元件
const alertComp = document.createElement('div');
document.body.appendChild(alertComp);
createApp(BaseAlert).mount(alertComp);

// 插入 loading 元件到 body
const loadingComp = document.createElement('div');
document.body.appendChild(loadingComp);
createApp(BaseLoading).mount(loadingComp);

app.use(createPinia())
app.use(router)

app.mount('#app')
