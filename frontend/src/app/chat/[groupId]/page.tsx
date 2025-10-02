
'use client';

import { useRouter ,useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client'
import { Message } from '@/types';

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const groupId = typeof params.groupId === 'string' ? params.groupId : 'Unknown Group';
  const groupName = searchParams.get('name') || groupId;
  const router = useRouter();
  const { token, user } = useAuth()
  const socketRef = useRef<Socket | null>(null);
  const [ messages, setMessages ] = useState<Message[]>([]);
  const [ content, setContent ] = useState<String | null>(null);

  useEffect(()=>{
    if(!token) return;

    const socket = io('http://localhost:3000',{
      auth:{
        token
      }
    });

    socketRef.current = socket;

    socket.on('connect', ()=>{
      console.log('Socket connected!', socket.id);
      socket.emit('joinRoom', groupId);
    });

    socket.on('newMessage',(newMessage)=>{
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on('allMessage',(messages)=> setMessages(messages));

    socket.on('connect_error', (error)=>{
      console.log('Connection error:', error);
    })

    return ()=>{
      if(socketRef.current){
        console.log('Disconnecting socket...');
        socketRef.current.disconnect();
      }
    }
  },[token]);

  const sendMessage = ()=>{
    socketRef.current?.emit('sendMessage' , {
      content,
      groupId
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]"> {/* Adjust height based on your layout */}
      <Card className="flex-grow flex flex-col shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-secondary/30 p-4 border-b">
          <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" aria-label="Back to dashboard" onClick={()=> router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            <CardTitle className="text-xl">{groupName}</CardTitle>
          </div>
          <CardDescription>This is a placeholder chat interface. Messaging is not functional.</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
         {messages.map(message =>{

         const isSender = user?._id == message.senderId._id;
         const isAdmin = user?.role == 'CANDIDATE' || 'ADMIN' ? true : false;
           
         return (<div className={`flex ${ isSender ? "justify-end" : "justify-start"}`}>
            <div className={` ${ isSender ? "bg-primary text-primary-foreground" : "bg-muted"} p-3 flex flex-col gap-2 rounded-lg w-1/2`}>
              <p className="text-sm font-semibold text-shadow-lg">{isAdmin ? "Admin": "Volunteer"} {message.senderId.name}</p>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-gray-400 text-right">{new Date(message.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
          )
         })
     }
        </CardContent>
        
        <div className="border-t p-4 bg-background">
          <div className="flex items-center space-x-2">
            <Textarea
              placeholder="Type your message here..."
              className="flex-grow resize-none"
              rows={1}
              onChange={(e)=>{
                 setContent(e.target.value);
              }}
            />
            <Button onClick={sendMessage} >
              <Send className="mr-2 h-4 w-4" /> Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
