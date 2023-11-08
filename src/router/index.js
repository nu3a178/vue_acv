import Vue from 'vue'
import VueRouter from 'vue-router'
import InputCalender from '../views/InputCalender.vue'
import MainView from '../views/MainView.vue'
import AddUser from '../views/AddUser.vue'
import inputEvent from '../views/inputEvent.vue'
Vue.use(VueRouter)

const routes = [

  {
    path: '/',
    name: 'main',
    component: MainView
  },
  {
    path: '/index.html',
    name: 'main',
    component: MainView
  },
  {
    path:'/input',
    name:'input',
    component: InputCalender
  },
   {
    path:'/add',
    name:'add',
    component: AddUser
   },

  {
    path: '/event',
    name: 'event',
    component: inputEvent
  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
