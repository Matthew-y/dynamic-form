import { message } from 'ant-design-vue'

const [messageApi] = message.useMessage()

// 消息处理
function handleMsg({ code, message }) {
    code === 200 ? messageApi.success(message) : messageApi.error(message)
}

export {
    handleMsg
}