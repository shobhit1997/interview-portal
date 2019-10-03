require('dotenv').config();
const socketIO = require('socket.io');
const server = require('./server');
var io = socketIO(server);
var { Users } = require('./users');

var users = new Users();
io.on('connection', client => {
    console.log(client.id);
    client.on('join', function(params, callback) {
        console.log(`${params.name} joined room ${params.room}`);
        client.join(params.room);
        if (params.source === 'candidate' && users.getUserByRoomAndSource(params.room, params.source)) {
            callback("Single Candidate can connect to the room")
        }
        else if (params.source === 'candidate' && users.getUserList(params.room).length===0) {
            callback("Only an interviewer can create a  room")
        }
        else {
            users.addUser(client.id, params.name, params.room, params.source);
            io.to(params.room).emit('room-joined', users.getUserList(params.room));
            client.emit('welcome-message', "Welcome to NCS Inteview Portal");
            callback();
        }
    });
    client.on('code-typed', function(data, callback) {
        var user = users.getUser(client.id);
        if(user){
        	client.broadcast.to(user.room).emit('code-typed', data);
        }
        callback();
    });
    client.on('input-changed', function(data, callback) {
        var user = users.getUser(client.id);
        if(user){
            client.broadcast.to(user.room).emit('input-changed', data);    
        }
        callback();
    });
    client.on('lang-changed', function(data, callback) {
        var user = users.getUser(client.id);
        if(user){
            client.broadcast.to(user.room).emit('lang-changed', data);    
        }
        callback();
    });
    client.on('output-changed', function(data, callback) {
        var user = users.getUser(client.id);
        if(user){
            client.broadcast.to(user.room).emit('output-changed', data);    
        }
        callback();
    });
    client.on('disconnect', () => {
        users.removeUser(client.id);
        console.log("disconnect")
    });
});