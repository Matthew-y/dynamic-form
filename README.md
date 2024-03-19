## 组件开发项目配置

详细开发教程可点击：[第一段 从0开始封装属于组件的ui组件库_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1xq4y1e7tC/?spm_id_from=333.788&vd_source=50eecc7cf56b19de49ea1a7082a0d636)

#### 本项目使用框架：vue3 + vite



##### 创建项目：

在文件夹打开cmd窗口，输入以下命令创建vite项目：

```npm
npm create vite
```

根据弹出的提示输入项目名称，选择vue框架。

cmd窗口中输入 cd 项目名称 进入项目文件夹，运行以下命令安装依赖：

```
npm i
```

_如果需要安装sass等依赖可另外自行安装_



##### 打开项目

使用webstorm或vscode打开项目，命令行窗口输入以下命令启动项目：

```
npm run dev
```



##### 新建目录

在项目根目录新建packages文件夹，用于后续开发组件；

在packages文件夹下新建index.js文件，用于统一管理开发的组件。



##### vite.config.js配置

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
    plugins: [vue()],
    build: { // 打包配置
        lib: {
            entry: "./packages/index.js" // 打包入口,
            name: "my-ui", // 打包后的组件库文件，建议写组件库的名称
        },
        rollupOptions: {
            external: ["vue"],
            output: {
                globals: { vue: "Vue" }
            }
        }
    }
})
```



##### package.json配置

```json
{
    "name": "my-ui", // 组件库名称
    "private": false, // 需要改为false，否则无法发布到npmjs官网
    "version": "0.0.1", // 版本号，
    "main": "./dist/my-ui.umd.js",
    "module": "./dist/my-ui.js", // 如果没有my-ui.js则是my-ui.es.js
    "exports": { // 输出
        ".": {
            "import": "./dist/my-ui.js", // 或my-ui.es.js
            "require": "./dist/my-ui.umd.js"
        }
    },
    "files": ["dist/*"],
    // 从这里开始下面的配置项不变，只有上面的配置需要手动修改
    "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@misaka69/mhui": "^0.0.0",
    "sass": "^1.62.1",
    "vue": "^3.2.47"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.1.0",
    "vite": "^4.3.2"
  }
}
```



##### 打包

命令行窗口运行以下命令打包：

```
npm run build
```

打包后会在根目录的dist文件夹下生成style.css，my-ui.umd.js和my-ui.js文件(my-ui-js也可能是my-ui.es.js)，这是打包完成的组件库源文件



##### 组件开发

以开发button组件为例，在packages目录下新建button目录，作为单个组件的目录；button目录下新建index.js和index.vue，在index.vue中开发组件，index.js用于导出组件

###### 组件的index.vue

```vue
<template>
    <div :class="btnClass">
        <button>
            <span><slot></slot></span>
        </button>
    </div>
</template>
<script>
export default {
    name: 'myButton' // 导出组件名称，必须声明
}
</script>
<script setup>
import { computed } from 'vue'

const props = defineProps({
    type: {
        type: String,
        default: ''
    }
})

const btnClass = computed(() => {
    return [
        'mh-button',
        props.type === '' ? '' : `mh-button-${props.type}`
    ]
})

</script>
<style lang="scss" scoped></style>
```

###### 组件的index.js

```javascript
import myButton from './index.vue'

// 组件的安装
myButton.install = app => {
    app.component(myButton.name, myButton) // 这里第二个参数要和组件名称一致
}

export default myButton // 导出当前组件，供packages目录下的index.js导入
```

###### packages下的index.js

```javascript
import myButton from './button/index.js'

const install = app => {
    app.use(myButton) // 每导入一个组件都要app.use
}

const MYUI = { // 全局引用
    install
}

export { // 按需引入
    myButton,
    ...
}

export default MYUI
```



##### 使用

在项目src目录下的main.js中引入

```javascript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import MYUI from '../dist/my-ui.js' // 引入组件库文件
import '../dist/style.css' // 组件库样式文件

const app = createApp(App)
app.use(MYUI) // 使用组件库

app.mount('#app')
```

页面中使用

```vue
<template>
	<div>
        <my-button type="primary">测试按钮</my-button>
    </div>
</template>
<script setup>
// 支持按需引入，如果在main.js完整引入可不用写这句
import { myButton } from '../dist/my-ui.js'
</script>
<style lang="scss" scoped></style>
```

