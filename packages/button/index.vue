<template>
    <div :class="btnClass">
        <button>
            <span><slot></slot></span>
        </button>
    </div>
</template>
<script>
export default {
    name: 'mhButton'
}
</script>
<script setup>
import { computed } from 'vue'
import { getTableConfig} from './api.js'

const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    baseUrl: {
        type: String,
        default: '/api',
    }
})

const btnClass = computed(() => {
    return [
        'mh-button',
        props.type === '' ? '' : `mh-button-${props.type}`
    ]
})

getTableConf();

function getTableConf() {
    getTableConfig(props.baseUrl, { fmId: '1645965546058481666' }).then(({data}) => {
        console.log('form btn')
        console.log(data)
    })
}

</script>

<style lang='scss' scoped>
button {
    outline: none;
    border: 0;
}

.mh-button {
    button {
        padding: 8px 14px;
        font-weight: normal;
        border-radius: $mhBorderRadius;
        border: 1px solid $primaryColor;
        color: $primaryColor;
        background-color: #fff;
        transition: all linear 0.3s;
        &:hover {
            background-color: #ecf5ff;
        }

        &:active {
            background-color: #fff;
        }
    }
}

.mh-button-primary, .mh-button-success, .mh-button-warning, .mh-button-danger, .mh-button-info {
    button { border-color: transparent; color: #fff; }
}

.mh-button-primary button {
    background-color: $primaryColor;
    &:hover {
        background-color: #66b1ff;
    }
    &:active {
        background-color: $primaryColor;
    }
}

.mh-button-success button {
    background-color: $successColor;
    &:hover {
        background-color: #85ce61;
    }
    &:active {
        background-color: $successColor;
    }
}

.mh-button-warning button {
    background-color: $warningColor;
    &:hover {
        background-color: #ebb563;
    }
    &:active {
        background-color: $warningColor;
    }
}

.mh-button-danger button {
    background-color: $dangerColor;
    &:hover {
        background-color: #f78989;
    }
    &:active {
        background-color: $dangerColor;
    }
}

.mh-button-info button {
    background-color: $infoColor;
    &:hover {
        background-color: #a6a9ad;
    }
    &:active {
        background-color: $infoColor;
    }
}
</style>