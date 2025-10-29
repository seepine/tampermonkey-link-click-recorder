import { createApp } from 'vue'
import 'tdesign-vue-next/es/style/index.css'
import './style.css'
import App from './App.vue'

createApp(App).mount(
  (() => {
    const app = document.createElement('div')
    // document.body.append(app)
    return app
  })()
)
