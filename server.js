const express = require('express');
const path = require('path');
const app = express();


//设置跨域访问
app.all('*', function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Origin',  '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With, yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (req.method === 'OPTIONS'){
      res.send(200);
    }
    else{
      next();
    }
});


const http = require('http');
const server = http.createServer(app);

const socketio = require('socket.io');
const io = socketio(server, {
    allowEIO3: true,
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = process.env.PORT || 5001;

app.use(express.static(path.join(__dirname, '/dist')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

const userList = [];
const messageList = [];

io.on('connection', (socket)=> {
    console.log('有用户进入房间', socket.id);    
    
    socket.on("clientMsg", msg => {
        socket.broadcast.emit('serverMsg', msg);
        // messageList 只保存100条聊天记录
        socket.emit('serverMsg', msg);
        if(messageList.length > 100) {
            messageList.splice(0, messageList.length - 100);
        }
        messageList.push(msg);
    });

    // socket.on('leaveRoom', userName=> {
    //     console.log('leaveRoom userName:', userName);
    //     const pos = userList.indexOf(userName);
    //     if(pos !== -1) {
    //         userList.splice(pos, 1);
    //     }
    //     socket.broadcast.emit('leaveRoom', userName, userList);
    // });

    socket.on('inRoom', userName => {
        console.log(userName + ' 进入房间');
        socket.userName = userName + ':' + socket.id;
        if(userList.indexOf(socket.userName) !== -1) {

        } else {
            userList.push(socket.userName);
            socket.broadcast.emit('inRoom', socket.userName, userList);
            socket.emit('inRoom', socket.userName, userList, messageList);
        }
        
    });

    socket.on('disconnect', ()=> {
        console.log(socket.userName + ' 离开房间');
        const pos = userList.indexOf(socket.userName);
        if(pos !== -1) {
            userList.splice(pos, 1);
        }
        socket.broadcast.emit('leaveRoom', socket.userName, userList);
        // socket.close();
        // userList.push();
        // socket.emit('userLeave', ,userName, userList);
    });
    
});

server.listen(PORT, ()=> {
    console.log(`server running on port ${PORT}`);
});

