import { CreateGroupChatForm } from "@/components/forms/CreateGroupChatForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, MessageSquare, MessageSquarePlus } from "lucide-react"
import { useVolunteer } from "../hooks/use-volunteer"
import { useChat } from "../hooks/use-chat"
import Link from "next/link"

export const GroupChat = ()=>{
    const { activeVolunteers } = useVolunteer();
    const { handleCreateGroupChat, isCreateGroupChatOpen, setIsCreateGroupChatOpen,createdGroupChats, loading: GroupChatLoading } = useChat(); 
    return (
        <Card className="shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className='text-primary'>Group Chats</CardTitle>
                            <CardDescription>Manage your volunteer communication channels.</CardDescription>
                        </div>
                         <Dialog open={isCreateGroupChatOpen} onOpenChange={setIsCreateGroupChatOpen}>
                            <DialogTrigger asChild>
                                <Button className='bg-primary'>
                                <MessageSquarePlus className="mr-2 h-4 w-4" /> Create Group Chat
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                <DialogTitle>Create New Group Chat</DialogTitle>
                                <DialogDescription>
                                    Organize volunteers by creating targeted group chats based on their interests.
                                </DialogDescription>
                                </DialogHeader>
                                <CreateGroupChatForm
                                    volunteers={activeVolunteers} 
                                    onSubmitSuccess={handleCreateGroupChat}
                                    onOpenChange={setIsCreateGroupChatOpen}
                                />
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {GroupChatLoading ? <div className="text-center text-muted-foreground py-8">
                                <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                                <h3 className="text-lg font-semibold">Loading...</h3>
                             </div>
                        : createdGroupChats.length > 0 ? (
                             <ul className="space-y-2">
                                {createdGroupChats.map(chat => (
                                    <li key={chat._id} className="text-sm p-3 border rounded-md hover:bg-muted/50 transition-colors">
                                        <Link href={`/chat/${chat._id}?name=${encodeURIComponent(chat.name)}`} className="flex justify-between items-center">
                                        <div>
                                            <span className="font-semibold">{chat.name}</span>
                                            <span className="text-muted-foreground"> ({chat.members?.length} member(s))</span>
                                        </div>
                                        <Eye className="h-4 w-4 text-primary" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <div className="text-center text-muted-foreground py-8">
                                <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                                <h3 className="text-lg font-semibold">No Group Chats Yet</h3>
                                <p className="text-sm">Create a group chat to start organizing your volunteers.</p>
                             </div>
                        )}
                    </CardContent>
                </Card>
    )
}