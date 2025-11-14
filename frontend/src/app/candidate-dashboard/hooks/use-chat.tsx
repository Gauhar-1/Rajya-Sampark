import { CreateGroupChatFormData } from "@/components/forms/CreateGroupChatForm";
import { useAuth } from "@/contexts/AuthContext";
import { GroupChat } from "@/types";
import axios from "axios";
import { useEffect, useState } from "react";

export const useChat = ()=>{
    const { token } = useAuth();
    const [isCreateGroupChatOpen, setIsCreateGroupChatOpen] = useState(false);
    const [createdGroupChats, setCreatedGroupChats] = useState<GroupChat[]>([]);
    const [ loading, setIsLoading ] = useState<Boolean>(false);

  useEffect(()=>{
    if(!token) return;

    const fetchGroups = async()=>{
        setIsLoading(true);
        try{
            const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/chat`,{
                headers:{
                    "Authorization": `Bearer ${token}`
                }
            });

            if(response.data.success){
                setCreatedGroupChats(response.data.groups)
            }
        }
        catch(err){
            console.log("Found error while fetching group chats", err)
        }
        finally{
            setIsLoading(false);
        }
    }

    fetchGroups();
  },[token])

  const handleCreateGroupChat = async(formData: CreateGroupChatFormData) => {
    const originalChat = createdGroupChats;
    const newGroupChat: GroupChat = {
      name: formData.groupName,
      description :  formData.selectedInterest,
      volunterIds: formData.volunteerIds,
      createdAt: new Date().toLocaleString(),
    };
    try{
        const response = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/chat`, newGroupChat, {
            headers:{
                "Authorization" : `Bearer ${token}`
            }
        });

        if(response.data.success){
            setCreatedGroupChats(prev => [...prev, newGroupChat]);
            console.log('New Group Chat Created:', newGroupChat);
        }
    }
    catch(err){
        setCreatedGroupChats(originalChat);
        console.log("Error found while creating group." ,err);
    }
    finally{
        setIsCreateGroupChatOpen(false); 
    }
  };

  return {
    isCreateGroupChatOpen,
    setIsCreateGroupChatOpen,
    createdGroupChats,
    handleCreateGroupChat,
    loading
  }
}