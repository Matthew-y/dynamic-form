<!--<link rel='stylesheet' href='style.css'>-->
<template>
    <div style='padding: 10px'>
        <div style='height: 800px'>
            <MhITable :fmId='fmId' :height='mainHeight' @createRow='handleCreate' @editRow='handleEdit' :baseUrl='baseUrl' />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MhITable from '../packages/mhITable/index.vue'
// import { MhITable, VTable } from '../dist/dynamic-form.js'

const fmId = '1645965546058481666'
const baseUrl = ref('/request') // 必须在项目做请求代理
let screenHeight = ref(0)
let mainHeight = computed(() => screenHeight.value - 160)

onMounted(() => {
    screenHeight.value = document.body.clientHeight || document.documentElement.clientHeight
})

function handleCreate() {
    console.log('create')
}

function handleEdit(id) {
    console.log(id)
}

</script>

<style lang='scss' scoped>

</style>