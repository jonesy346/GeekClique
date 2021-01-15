const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages.js');
const { userJoin, getCurrentUser, userLeavesRoom, getRoomUsers } = require('./utils/users.js');
const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');
const { ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const admin = 'Admin';

app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 27017;

const uri = process.env.MONGODB_URI;
let clique = '';

const client = new MongoClient(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

client.connect(err => {
    if(err) throw err;

    const rooms = client.db("rooms");

    // Socket.io functions
    // on client connection
    io.on('connection', socket => {
        socket.on('joinRoom', ({ username, roomOptions, room }) => {
            const user = userJoin(socket.id, username, room);

            if (roomOptions === 'create-room') {
                socket.broadcast.emit('message', formatMessage(admin, `${user.room} has been created!`));
            }

            socket.join(user.room);

            // send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })

            clique = rooms.collection(`${user.room}`);

            // get chats from mongo collection
            clique.find().limit(100).sort({_id:1}).toArray(function(err, res) {
                if (err) throw err;

                // emit the messages
                socket.emit('output', res);

                // welcome current user
                socket.emit('message', formatMessage(admin, 'Welcome to GeekClique!'));

            });

            // get rated chats from mongo collection
            clique.find().limit(3).sort({hearts:-1}).toArray(function(err, res) {
                if (err) throw err;

                // emit the most liked messages
                socket.emit('mostLikedMessages', res);
            });

            clique.find().limit(3).sort({smarts:-1}).toArray(function(err, res) {
                if (err) throw err;

                // emit the smartest messages
                socket.emit('smartestMessages', res);
            });

            clique.find().limit(3).sort({laughs:-1}).toArray(function(err, res) {
                if (err) throw err;

                // emit the smartest messages
                socket.emit('funniestMessages', res);
            });            

            // broadcast that the user has joined
            socket.broadcast.to(user.room).emit('message', formatMessage(admin, `${user.username} has joined the chat`));
        });

        // listen for chatmessage
        socket.on('chatMessage', msg => {
            const user = getCurrentUser(socket.id);
            const formattedMessage = formatMessage(user.username, msg);
            const objectToInsert = {
                userID: `${socket.id}`,
                username: `${formattedMessage.username}`,
                text: `${formattedMessage.text}`,
                time: moment().format("MMM D, YYYY, h:mm a"),                
                likes: 0,
                smarts: 0,
                laughs: 0
            };
            clique.insertOne(objectToInsert, (err, res) => {
                if (err) throw err;
                io.to(user.room).emit('message', res.ops[0]);
            });
            
        });

        socket.on('updateRating', data => {
            if (data.status === "likes") {
                let newLikes;
                clique.findOne({ _id: ObjectId(`${data._id}`) }).then(
                    document => {
                        if (data.isClicked === false) {
                            newLikes = document.likes + 1;
                        } else {
                            newLikes = document.likes - 1;
                        }
                        
                        clique.updateOne(
                            { _id: ObjectId(`${data._id}`) }, 
                            { $set: {"likes": newLikes} }
                        );
                    }
                );
            } else if (data.status === "smarts") {
                let newSmarts;
                clique.findOne({ _id: ObjectId(`${data._id}`) }).then(
                    document => {
                        if (data.isClicked === false) {
                            newSmarts = document.smarts + 1;
                        } else {
                            newSmarts = document.smarts - 1;
                        }
                        
                        clique.updateOne(
                            { _id: ObjectId(`${data._id}`) }, 
                            { $set: {"smarts": newSmarts} }
                        );
                    }
                );
            } else if (data.status === "laughs") {
                let newLaughs;
                clique.findOne({ _id: ObjectId(`${data._id}`) }).then(
                    document => {
                        if (data.isClicked === false) {
                            newLaughs = document.laughs + 1;
                        } else {
                            newLikes = document.likes - 1;
                        }
                        
                        clique.updateOne(
                            { _id: ObjectId(`${data._id}`) }, 
                            { $set: {"laughs": newLaughs} }
                        );
                    }
                );
            }
        });

        // runs when client disconnects
        socket.on('disconnect', () => {
            const user = userLeavesRoom(socket.id);

            if (user) {
                io.to(user.room).emit('message', formatMessage(admin, `${user.username} has left the chat`));

                // send users and room info
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }
        });
    });

    // perform actions on the collection object
    // client.close();
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
