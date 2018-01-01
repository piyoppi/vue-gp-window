import Vue from 'vue'
import Vuex from "vuex"

Vue.use(Vuex);

const appOptions = require('./stateTest.vue');
window.addEventListener("load", ()=>new Vue(appOptions).$mount('#app-entrypoint'), false);
