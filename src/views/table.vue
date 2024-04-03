<template>
    <div class="p10">
        <div style='height: 800px'>
            <Table :fmId='fmId' :height='mainHeight' @createRow='handleCreate' @editRow='handleEdit' :baseUrl='baseUrl' />
        </div>
    </div>
</template>
<script setup>
import Table from '../../packages/mhITable/index.vue'
import { ref, computed, onMounted } from 'vue'

const fmId = '1645965546058481666'
const baseUrl = ref('/request') // 必须在项目做请求代理
let screenHeight = ref(0)
let mainHeight = computed(() => screenHeight.value - 160 + 'px')

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

<style scoped lang="scss">
.p10 {
    padding: 10px;
}
</style>