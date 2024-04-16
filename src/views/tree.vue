<template>
    <div class="tree-container">
        <Tree :baseUrl="baseUrl" :fmId="fmId"></Tree>
    </div>
</template>

<script setup>
import { Tree } from "../../dist/mh-i-table.js";

import {ref} from "vue";

const fmId = '1645965546058481666'
const baseUrl = ref('/request') // 必须在项目做请求代理
</script>

<style scoped lang="scss">
.tree-container {
    margin: 0 auto;
    border: 1px solid skyblue;
    width: 400px;
    height: 700px;
}
</style>