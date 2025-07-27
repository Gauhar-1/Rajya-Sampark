
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RequiredAuth } from '@/components/auth/RequiredAuth';
import { mockVolunteerTasks, mockVolunteerPosts, mockVolunteerCampaigns, mockVolunteerGroupChats, mockCampaigns } from '@/lib/mockData';
import type { VolunteerTask, VolunteerPost, VolunteerCampaign, GroupChat, Campaign } from '@/types';
import { ListTodo, Edit, Trash2, Megaphone, Newspaper, MessageSquare, ChevronRight, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateCampaignForm } from '@/components/forms/CreateCampaignForm';

function getStatusVariant(status: VolunteerTask['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Completed': return 'default';
    case 'In Progress': return 'secondary';
    case 'To Do': return 'destructive';
    default: return 'outline';
  }
}

export default function VolunteerDashboardPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<VolunteerTask[]>(mockVolunteerTasks);
  const [posts, setPosts] = useState<VolunteerPost[]>(mockVolunteerPosts);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [groupChats, setGroupChats] = useState<GroupChat[]>(mockVolunteerGroupChats);
    const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const handleStatusChange = (taskId: string, newStatus: VolunteerTask['status']) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
    toast({ title: "Task Status Updated!", description: `Task is now "${newStatus}".` });
  };
  
   const handleEditPost = (id: string) => {
     toast({ title: `Edit Post (Simulated)`, description: `This would open an editor for item ${id}.` });
  }

  const handleDelete = (type: 'Post' | 'Campaign', id: string) => {
    if (type === 'Post') {
      setPosts(prev => prev.filter(p => p.id !== id));
    } else if (type === 'Campaign') {
      setCampaigns(prev => prev.filter(c => c.id !== id));
    }
    toast({ title: `${type} Deleted`, description: `The item has been removed from your list.` });
  };

  const openCampaignDialog = (campaign: Campaign | null) => {
    setEditingCampaign(campaign);
    setIsCampaignDialogOpen(true);
  };

  const handleSaveCampaign = (campaignData: Campaign) => {
    if (editingCampaign) {
      // Update existing campaign
      const updatedCampaign: Campaign = {
        ...campaignData,
        createdAt: editingCampaign.createdAt || new Date().toISOString()
      };
      setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? updatedCampaign : c));
      toast({ title: "Campaign Updated", description: `Campaign "${campaignData.name}" has been updated.` });
    } else {
      // Create new campaign
      const newVolunteerCampaign: Campaign = {
        ...campaignData,
        createdAt: new Date().toISOString()
      };
      setCampaigns(prev => [newVolunteerCampaign, ...prev]);
      toast({ title: "Campaign Created!", description: `Your new campaign "${campaignData.name}" is now live.` });
    }
    setIsCampaignDialogOpen(false);
    setEditingCampaign(null);
  };


  return (
    <RequiredAuth allowedRoles={['VOLUNTEER']} redirectTo='/'>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center">
          <ListTodo className="mr-3 h-7 w-7 text-primary" />
          Volunteer Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your assigned tasks and contributions in one place.
        </p>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks">
              <ListTodo className="mr-2 h-4 w-4" /> My Tasks ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="posts">
              <Newspaper className="mr-2 h-4 w-4" /> My Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <Megaphone className="mr-2 h-4 w-4" /> My Campaigns ({campaigns.length})
            </TabsTrigger>
            <TabsTrigger value="chats">
              <MessageSquare className="mr-2 h-4 w-4" /> My Group Chats ({groupChats.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="mt-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Assigned Tasks</CardTitle>
                <CardDescription>Tasks assigned to you by candidates you support.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assigned By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.length > 0 ? tasks.map(task => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.assignedBy}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
                        </TableCell>
                        <TableCell className="flex gap-2">
                           <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleStatusChange(task.id, 'In Progress')} 
                                disabled={task.status === 'In Progress'}>
                                Start
                            </Button>
                           <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleStatusChange(task.id, 'Completed')} 
                                disabled={task.status === 'Completed'}>
                                Complete
                           </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">No tasks assigned yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="posts" className="mt-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Your Posts</CardTitle>
                <CardDescription>Posts you have created on the main feed.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content Snippet</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.length > 0 ? posts.map(post => (
                      <TableRow key={post.id}>
                        <TableCell className="max-w-md truncate">"{post.contentSnippet}"</TableCell>
                        <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditPost(post.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                           <Button variant="ghost" size="icon" onClick={() => handleDelete('Post', post.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">You haven't created any posts.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-4">
            <Card className="shadow-md">
               <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                    <CardTitle>Your Campaigns</CardTitle>
                    <CardDescription>Campaigns you have initiated and are managing.</CardDescription>
                 </div>
                <Button onClick={() => openCampaignDialog(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Campaign
                 </Button>
              </CardHeader>
              <CardContent>
                <Table>
                   <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.length > 0 ? campaigns.map(campaign => (
                       <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{campaign.location}</TableCell>
                        <TableCell>{new Date(campaign.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="flex gap-2">
                           <Button variant="ghost" size="icon" onClick={() => openCampaignDialog(campaign)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                           <Button variant="ghost" size="icon" onClick={() => handleDelete('Campaign', campaign.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                         <TableCell colSpan={4} className="text-center text-muted-foreground">You haven't created any campaigns.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
           <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
              <DialogContent className="sm:max-w-[480px] overflow-y-auto max-h-[90vh]">
                  <DialogHeader>
                  <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create a New Campaign'}</DialogTitle>
                  <DialogDescription>
                      {editingCampaign ? 'Update the details for your campaign.' : 'Fill in the details below to launch your campaign.'}
                  </DialogDescription>
                  </DialogHeader>
                  <CreateCampaignForm 
                    onSubmitSuccess={handleSaveCampaign} 
                    onOpenChange={setIsCampaignDialogOpen}
                    initialData={editingCampaign}
                  />
              </DialogContent>
          </Dialog>

          <TabsContent value="chats" className="mt-4">
             <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>My Group Chats</CardTitle>
                    <CardDescription>Group chats you've been added to by candidates.</CardDescription>
                </CardHeader>
                <CardContent>
                    {groupChats.length > 0 ? (
                        <ul className="space-y-2">
                            {groupChats.map(chat => (
                                <li key={chat.id}>
                                    <Link href={`/chat/${chat.id}?name=${encodeURIComponent(chat.name)}`} passHref>
                                        <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
                                            <div>
                                                <p className="font-semibold">{chat.name}</p>
                                                <p className="text-sm text-muted-foreground">Managed by: {chat.candidateId}</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                            <h3 className="text-lg font-semibold">No Group Chats Yet</h3>
                            <p className="text-sm">Candidates will add you to group chats here for coordination.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RequiredAuth>
  );
}
