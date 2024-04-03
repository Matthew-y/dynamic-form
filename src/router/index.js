import { createWebHistory, createRouter } from "vue-router";

const routes = [
    {
        path: '/',
        name: 'layout',
        component: () => import('@/views/layout.vue')
    },
    {
        path: '/table',
        name: 'table',
        component: () => import('@/views/table.vue')
    },
    {
        path: '/tree',
        name: 'tree',
        component: () => import('@/views/tree.vue')
    },
    {
        path: '/plan',
        name: 'tree',
        component: () => import('@/views/plan.vue')
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router