import { createServer } from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from 'jsonwebtoken'
import Message from "./models/Message.js";
import Group from "./models/Group.js";
import { Schema } from "mongoose";

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors:{
        origin: 'http://localhost:9002',
        methods: ["GET", "POST"]
    }
});

io.use((socket, next) =>{
    const token = socket.handshake.auth.token;

    if(!token) return next(new Error("Authentication error: Token not provided"));

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload)=>{
        if(err) return next(new Error("Authentication error: Invalid token"));

        socket.user = decodedPayload;
        next();
    });
});

io.on("connection", (socket)=>{
    console.log(`User connected: ${socket.user.profile.name} (${socket.id})`);

    socket.on('joinRoom', async(groupId) =>{
        socket.join(groupId);

        try{
            const group = await Group.findById(groupId);

            if(!group) {
                socket.emit('error', { message: "No group found" });
                return;
            }

            const messages = await Message.find({ groupId }).populate('senderId');

            io.to(groupId).emit('allMessage', { messages, groupDescription: group.description });
        }
        catch(err){
            console.log("Error found while sending All message", err);
        }
        finally{
            console.log(`User ${socket.user.profile.name} join room: ${groupId}`);
        }

    });


    socket.on('sendMessage', async(data)=>{
        const { groupId, content } = data;

        if(!groupId || !content) {
            socket.emit('error', { message: 'Group ID and content are required.'});
            return;
        }

        try{
            const messageData = {
                groupId,
                senderId: socket.user.profile._id,
                content,
            };

            const newMessage = new Message(messageData);
            await newMessage.save();

            const populatedMessage = await newMessage.populate('senderId');

            io.to(groupId).emit('newMessage', populatedMessage);
            console.log(`Message from ${socket.user.profile.name} in room ${groupId}: ${content}`);
        }
        catch(err){
            console.log('Error saving or broadcasting message.', err);
            socket.emit('error', { message: 'Failed to send message.'});
        }
    });

    socket.on("disconnect", ()=>{
        console.log(`User disconnected: ${socket.user.profile.name} (${socket.id})`);
    })
})

export default httpServer;