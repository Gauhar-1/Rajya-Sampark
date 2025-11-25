'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RequiredAuth } from '@/components/auth/RequiredAuth';
import type { VolunteerTask, VolunteerPost, VolunteerCampaign, GroupChat, Campaign, AssignedTask, IssuePost } from '@/types';
import { ListTodo, Edit, Trash2, Megaphone, Newspaper, MessageSquare, ChevronRight, PlusCircle, Cross, View } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateCampaignForm } from '@/components/forms/CreateCampaignForm';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

function getStatusVariant(status: VolunteerTask['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Completed': return 'default';
    case 'In Progress': return 'secondary';
    case 'To Do': return 'destructive';
    default: return 'outline';
  }
}

function getStatusVariantForPost(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'pending': return 'default';
    case 'approved': return 'secondary';
    case 'rejected': return 'destructive';
    case 'assigned': return 'outline';
    case 'resolved': return 'default';
    default: return 'outline'
  }
}

export default function VolunteerDashboardPage() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [issuePosts, setIssuePosts] = useState<IssuePost[]>([]);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // tasks
  useEffect(() => {
    if (!token) return;

    const getTasks = async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/task/volunteer`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setTasks(response.data.data?.tasks || response.data.tasks);
      }
    }
    getTasks();
  }, [token]);

  const handleStatusChange = async (taskId: string, newStatus: VolunteerTask['status']) => {

    const response = await axios.patch(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/task/${taskId}/status`, { newStatus }, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.data.success) {
      setTasks(prev => prev.map(task => task._id === taskId ? { ...task, status: newStatus } : task));
      toast({ title: "Task Status Updated!", description: `Task is now "${newStatus}".` });
    }

  };

  const openCampaignDialog = (campaign: Campaign | null) => {
    setEditingCampaign(campaign);
    setIsCampaignDialogOpen(true);
  };

  // Campaigns
  useEffect(() => {
    if (!token) return;

    const getCampaigns = async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/campaign/volunteer`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setCampaigns(response.data.data?.campaigns || response.data.campaigns);
      }
    }
    getCampaigns();
  }, [token]);

  const handleSaveCampaign = async (campaignData: Campaign) => {
    if (editingCampaign) {
      // Update existing campaign
      const response = await axios.put(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/campaign`, campaignData, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const { campaign } = response.data.data || response.data;
        setCampaigns(prev => prev.map(c => c._id === editingCampaign._id ? campaign : c));
        toast({ title: "Campaign Updated", description: `Campaign "${campaignData.name}" has been updated.` });
      }
    } else {

      const response = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/campaign`, campaignData, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      if (response.data.success) {
        const { campaign } = response.data.data || response.data;
        setCampaigns(prev => [campaign, ...prev]);
        toast({ title: "Campaign Created!", description: `Your new campaign "${campaignData.name}" is now live.` });
      }
    }
    setIsCampaignDialogOpen(false);
    setEditingCampaign(null);
  };

  // Groups
  useEffect(() => {
    if (!token) return;
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/chat/volunteer`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setGroupChats(response.data.data?.groups || response.data.groups)
        }
      }
      catch (err) {
        console.log('Found error while fetching volunter groups', err);
      }
    }

    fetchGroups();
  }, [token]);

  // Issue Post
  useEffect(() => {
    if (!token) return;
    const fetchIssuePosts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/issue`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setIssuePosts(response.data.data?.posts || response.data.posts);
        }

      }
      catch (err) {
        console.log("Error found while fetching issue post");
      }
    }

    fetchIssuePosts();

  }, [token]);

  const handleTakePermission = async (id: string) => {
    if (!token) return;

    try {
      const response = await axios.patch(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/issue/${id}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setIssuePosts(prev => (prev.map(p => p._id == id ? { ...p, status: 'pending' } : p)));
        toast({ title: `Issue Post`, description: `Permission Request sent Successfully` });
      }
    }
    catch (err) {
      console.error(`Error found`, err);
      toast({ title: `Issue Post`, description: `Error Found during the process`, variant: 'destructive' });
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return;

    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/issue/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setIssuePosts(prev => prev.filter(p => p._id != id));
        toast({ title: 'Issue Post', description: `${id} removed` });
      }
    }
    catch (err) {
      console.log('Found error while deleting issue post', err);
    }
  };

  return (
    <RequiredAuth allowedRoles={['VOLUNTEER', 'ADMIN']} redirectTo='/'>
      <div className="space-y-6 max-w-screen">
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
              <Newspaper className="mr-2 h-4 w-4" /> My Posts ({issuePosts?.length})
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
                <CardTitle className='text-primary'>Assigned Tasks</CardTitle>
                <CardDescription>Tasks assigned to you by candidates you support.</CardDescription>
              </CardHeader>
              <CardContent className='bg-primary m-2 rounded-lg border-4 border-black p-2'>
                <Table className='bg-white'>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assigned At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.length > 0 ? tasks.map(task => (
                      <TableRow key={task._id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{new Date(task.assignedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            className='text-violet-500'
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(task._id, 'In Progress')}
                            disabled={task.status === 'In Progress'}>
                            Start
                          </Button>
                          <Button
                            className='text-violet-500'
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(task._id, 'Completed')}
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
                <CardTitle className='text-primary'>Issue Posts</CardTitle>
                <CardDescription>Issue you have taken from the main feed.</CardDescription>
              </CardHeader>
              <CardContent className='bg-primary m-2 p-2 rounded-lg border-4 border-black'>
                <Table className='bg-white'>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content Snippet</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issuePosts?.length > 0 ? issuePosts.map(post => (
                      <TableRow key={post._id}>
                        <TableCell className="max-w-md truncate">"{post.postId ? post.postId.content : 'Post Deleted'}"</TableCell>
                        <TableCell>
                          <Badge className='hover:text-white' variant={getStatusVariantForPost('')}>{post.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="flex gap-2">
                          <Link href={`post/${post.postId ? post.postId._id : ''}`}>
                            <Button variant="ghost" size="icon">
                              <View className="h-4 w-4" />
                            </Button>
                          </Link>
                          {post.status == 'idle' && (
                            <div>
                              <Button variant="ghost" size="icon" onClick={() => handleTakePermission(post._id)}>
                                <Cross className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(post._id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          <div className='bg-primary text-white rounded-lg p-2'>You haven't taken any posts.</div>
                        </TableCell>
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
                  <CardTitle className='text-primary'>Your Campaigns</CardTitle>
                  <CardDescription>Campaigns you have initiated and are managing.</CardDescription>
                </div>
                <Button className='bg-primary hover:bg-violet-900' onClick={() => openCampaignDialog(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Campaign
                </Button>
              </CardHeader>
              <CardContent className='bg-primary m-2 p-2 rounded-lg border-4 border-black'>
                <Table className='bg-white'>
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
                      <TableRow key={campaign._id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{campaign.location}</TableCell>
                        <TableCell>{new Date(campaign.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openCampaignDialog(campaign)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" >
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
                <CardTitle className='text-primary'>My Group Chats</CardTitle>
                <CardDescription>Group chats you've been added to by candidates.</CardDescription>
              </CardHeader>
              <CardContent className='bg-primary m-2 p-2 rounded-lg border-4 border-black'>
                {groupChats.length > 0 ? (
                  <ul className="space-y-2">
                    {groupChats.map(chat => (
                      <li key={chat._id}>
                        <Link href={`/chat/${chat._id}?name=${encodeURIComponent(chat.name)}`} passHref>
                          <div className="flex items-center justify-between p-3 border-4 border-black bg-white rounded-md hover:bg-violet-900 hover:text-white transition-colors cursor-pointer ">
                            <div>
                              <p className="font-semibold">{chat.name}</p>
                              <p className="text-sm text-muted-foreground">Managed by: {chat.createdBy?.name}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-white py-8">
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
