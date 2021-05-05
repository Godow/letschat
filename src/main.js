// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import VueSocketIO from 'vue-socket.io'
 
Vue.use(ElementUI);
// Vue.use(Button);
Vue.use(new VueSocketIO({
    debug: false,
    connection: 'http://118.31.189.49:5001',
    // connection: 'http://localhost:5001',
    vuex: {
    },
    options: { autoConnect: false }
}));

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  
  sockets: {
    connecting() {
      console.log("正在连接");
    },
    disconnect() {
      console.log("Socket 断开");
    },
    connect_failed() {
      cosnole.log("连接失败");
    },
    connect() {
      console.log("连接成功");
    }
  },
  components: { App },
  template: '<App/>'
})
