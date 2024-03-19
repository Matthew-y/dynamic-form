import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
      find: 'vue',
      replacement: '/dist/dynamic-form.umd.cjs'
    }
  },
  server: {
    proxy: {
      '/request': {
        target: 'http://172.17.1.71:1302',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace('/request', ''),
      },
    }
  },
  build: {
    lib: {
      name: 'DynamicForm',
      entry: './packages/index.js'
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue"
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: "@use './src/assets/styles/style.scss' as *;"
      }
    }
  }
})
