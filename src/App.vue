<template>
    <div id="app" v-show="appShow">
        <header>
            CHATTING ROOM
            <!-- <el-button style="position:absolute;right:0;bottom:0;opacity:0.7" 
                size="mini" 
                @click="leaveRoom" 
                type="warning"
                plain 
            >
                离开房间
            </el-button> -->
        </header>
        <aside class="aside-left">
            在线用户列表
            <template v-for="(userName,inx) in userList">
                <li :key="inx">{{ userName | userNameFilter }}</li>
            </template>
        </aside>
        <div class="aside-right">
            <div id="msgBox">
                <template v-for="(item,inx) in messageList">
                    <div :key="inx" v-if="item.userName === userName" style="overflow:hidden">
                        <div style="float:right;margin-right:10px;">
                            <div style="overflow:hidden">
                                <div style="float:right;font-size:14px;">
                                    【{{item.userName | userNameFilter }}】{{ item.time }}
                                </div>
                                <!-- <img src="https://bing.ioliu.cn/v1/rand?w=100&h=100"/> -->
                            </div>
                            
                            <div style="float:right;font-size:18px">
                                {{item.data}}
                            </div>
                        </div>
                    </div>
                    <div v-else :key="inx">
                        <div style="font-size:14px">
                            【{{item.userName | userNameFilter }}】{{ item.time }}
                        </div>
                        <div :key="item.time+inx" style="font-size:18px">
                            {{item.data}}
                        </div>
                    </div>

                    
                </template>
            </div>
            <div class="sendMsgBox">
                <el-input
                    type="textarea"
                    :autofocus="true"
                    rows="4"
                    resize="none"
                    placeholder="请输入内容"
                    @keyup.enter.native="sendMessage" 
                    v-model.trim="messageInputArea">
                </el-input>
                <el-button 
                    :disabled="messageInputArea.length == 0" 
                    @click="sendMessage" 
                    type="primary"
                    class="sendMsgBtn"
                >
                    发送消息 ⏎
                </el-button>
            </div>
            
        </div>
        
    </div>
</template>

<script>
export default ({
  data() {
    return {
        messageList: [],
        messageInputArea: '',
        userName: '',
        userList: [],
        appShow: false
    }
  },
  filters: {
      userNameFilter(value) {
          return value.split(':')[0];
      }
  },
  watch: {
    //   userName() {
    //       this.login();
    //   }
  },
  mounted() {
      this.login();

    },
    sockets: {
        // connect(data) {
        //     console.log(data);
        // },
        // welcome: data => {
        //     console.log("welcome data数据返回= >", data);
        // }
    },
    // beforeDestroy() {
    //      this.leaveRoom();
    // },
    // destroyed() {
    //     this.leaveRoom();
    // },
    updated(){
        // 聊天定位到底部
        let msgBox = document.getElementById('msgBox');
        msgBox.scrollTop = msgBox.scrollHeight;
    },
  methods: {
      async getNickName() {
          const _this = this;
        await this.$prompt('请输入您的昵称', 'IM聊天室', {
          confirmButtonText: '确定',
          showClose: false,
          closeOnClickModal: false,
          showCancelButton: false,
        //   cancelButtonText: '取消',
          inputPattern: /^\S{2,10}$/,
          inputErrorMessage: '昵称长度应2~10个字符'
        }).then(({ value }) => {
            _this.userName = value;
          this.$message({
            type: 'success',
            message: '您的昵称是: ' + value
          });
        });
      },
      beforeunloadFn() {
        //   this.leaveRoom();
      }, 
    //   leaveRoom() {
    //       this.appShow = false;
    //     //   this.$socket.emit('leaveRoom', this.userName);  
    //     //   localStorage.setItem('userName', '');
    //       this.removeListener();
    //       this.$socket.disconnect(); 
    //       setTimeout(()=>{
    //           this.userName = ''; 
    //         //    window.location.href = "about:blank";                    //关键是这句话
    //             // window.close();
    //       }, 300);

    //       this.login();
    //   },
      addListener() {
        // window.addEventListener('beforeunload', this.beforeunloadFn);
        this.sockets.subscribe("serverMsg", msg => {
            this.messageList.push(msg);
        });
        this.sockets.subscribe("inRoom", userInfo => {
            if(userInfo[0].split(':')[0] !== this.userName) {
                this.$notify({
                    title: '',
                    message: `${userInfo[0].split(':')[0]}进入房间`,
                    type: 'success'
                });
            } else {
                this.messageList = userInfo[2];
                this.userName = userInfo[0];
            }
            this.userList = userInfo[1];
            
        });
        this.sockets.subscribe("leaveRoom", userInfo => {
            if(userInfo[0] !== this.userName) {
                this.$notify({
                    title: '',
                    message: `${userInfo[0].split(':')[0]}离开房间`,
                    type: 'info'
                });
            }
            this.userList = userInfo[1];
        });
      },
      removeListener() {
        //   window.removeEventListener('beforeunload', () => this.beforeunloadFn());

          this.sockets.unsubscribe('serverMsg');
          this.sockets.unsubscribe('inRoom');
          this.sockets.unsubscribe('leaveRoom');
      },
      async login() {
        // this.userName = localStorage.getItem('userName');
        while(!this.userName) {
            await this.getNickName();
        }
        // localStorage.setItem('userName', this.userName);

        this.addListener();
        this.$socket.connect();

        this.$socket.emit('inRoom', this.userName);

        this.appShow = true;
      },
      now() {
          return new Date().toLocaleTimeString();
      },
    // 发送消息
    sendMessage() {
        if(!this.messageInputArea) {
            return;
        }
        const msgObj = {
            userName: this.userName,
            time: this.now(),
            data: this.messageInputArea
        };
        this.$socket.emit("clientMsg", msgObj);
        this.messageInputArea = '';

        // this.$socket.disconnect();
        // this.$socket.connect('con text');
    },
  }
})
</script>

<style>
* {
    margin: 0;
    padding: 0;
}

html {
    background-image: url('../static/img/2.jpg');
    background-repeat:no-repeat;
    background-attachment:fixed;
    background-position:bottom;
    background-size:over;
}

#app .el-textarea__inner{
        background: rgba(255,255,255,0);
        color: white;
   }

/* .sendMsgBox textarea.el-textarea__inner {
    min-width: 50vw;
} */
</style>
<style scoped>
*{
    color: white;
}

header {
    position: relative;
    height: 6vh;
    line-height: 6vh;
    text-align: center;
}
.aside-left {
    box-sizing: border-box;
    padding: 20px;
    background-color: rgba(255,255,255,0);
    border-right: rgb(64, 158, 255) solid 1px;
    min-width:200px;
    height: 94vh;
    display: block;
    float: left;
    overflow-x:hidden;
}

.aside-right {
    box-sizing: border-box;
    padding: 20px;
    background-color: rgba(255,255,255,0);
    display: block;
    margin-left: 200px;
    width: calc(100vw - 200px);
    height: 94vh;
    position: relative;
}

.sendMsgBox {
    position: absolute;
    width: 100%;
    bottom: 0px;
    right:0;
}

.sendMsgBtn {
    position: absolute;
    right:0px;
    bottom: 0px;
    opacity: 0.6;
}

#msgBox {
    overflow-x:hidden;
    height: 75vh;
}
</style>

