import Tree from './index.vue'


Tree.install = app => {
    app.component(Tree.name, Tree)
}

export default Tree