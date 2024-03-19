import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import DynamicForm from '../dist/dynamic-form.js'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import '../dist/style.css'

const app = createApp(App)
app.use(DynamicForm)
app.use(VXETable)

app.mount('#app')
