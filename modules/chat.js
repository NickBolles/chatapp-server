var config          = require('./../config/config'),
    io              = require('socket.io'),
    mode            = process.env.NODE_ENV || 'development',
    ioServer        = io.listen(8084)
    dbConnect       = require('./dbConnect.js'),
    cookieParser    = require('cookie-parser'),
    moment          = require('moment'),
    sequence = 1,
    users = [];
// Event fired every time a new client connects:
ioServer.on('connection', function(socket) {
    console.info('New client connected (id=' + socket.id + ').');
    socket.emit("message", {text: "Welcome!", user:"System", sent: getUnix()});
    socket.on("login", function(user){
        users[user.username] = socket;
        socket.user = {};
        socket.user.username = user.username;
    });

    //Add the new connection to the list of connected users

    socket.on("private", function(data) {
        ioServer.sockets.sockets[data.to].emit("private", { from: client.id, to: data.to, msg: data.msg });
        socket.emit("private", { from: client.id, to: data.to, msg: data.msg });
    });


    // join to room and save the room name
    socket.on('join room', function (room) {
        socket.set('room', room, function() { console.log('room ' + room + ' saved'); } );
        socket.join(room);
    });

    socket.on('message', function(data) {
        if (typeof data == 'string'){
            data = {text: data};
        }
        if (socket.user && socket.user.username){
            data.user = socket.user.username;
        }
        else{
            data.user = "Anonymous";
        }
        data.sent = getUnix();
        ioServer.emit('message', data);
        // lookup room and broadcast to that room
        //socket.get('room', function(err, room) {
        //    io.sockets.in(room).emit('message', data);
        //})
    });


    // When socket disconnects, remove it from the list:
    socket.on('disconnect', function() {
        //take user offline
        //var index = clients.indexOf(socket);
        //if (index != -1) {
        //    clients.splice(index, 1);
        //    console.info('Client gone (id=' + socket.id + ').');
        //}
    });
});
setInterval(function SendTimeToAllClients(){
    var time = moment.utc().format("dddd, MMMM Do YYYY, h:mm:ss a");
    ioServer.emit('message', {text: time, user: "system", sent: getUnix()});
    console.log("Sending message: " + time + " to " + ioServer.sockets.sockets.length + " clients");
}, 10000);

//ioServer.set( 'authorization', passportSocketIo.authorize({
//    cookieParser: cookieParser,
//    key:         'sid',       // the name of the cookie where express/connect stores its session_id
//    secret:      config.sessionId,    // the session_secret to parse the cookie
//    store:       global.mongooseSession,        // we NEED to use a sessionstore. no memorystore please
//    success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
//    fail:        onAuthorizeFail     // *optional* callback on fail/error - read more below
//}));

function onAuthorizeSuccess(data, accept){
    console.log('successful connection to socket.io');
    // If you use socket.io@1.X the callback looks different
    accept();
}

function onAuthorizeFail(data, message, error, accept){
    if(error)
        throw new Error(message);
    console.log('failed connection to socket.io:', message);
    // If you use socket.io@1.X the callback looks different
    // If you don't want to accept the connection
    if(error)
        accept(new Error(message));
    // this error will be sent to the user as a special error-package
    // see: http://socket.io/docs/client-api/#socket > error-object
}
// Every 1 second, sends a message to a random client:
//setInterval(function() {
//    var randomClient;
//    if (clients.length > 0) {
//        randomClient = Math.floor(Math.random() * clients.length);
//        clients[randomClient].emit('foo', sequence++);
//    }
//}, 1000);

function getUnix(){
    return moment.utc().format("X");
}