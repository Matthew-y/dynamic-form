import mhButton from './index.vue'

mhButton.install = app => {
    app.component(mhButton.name, mhButton)
}

export default mhButton