
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { RequiredAuth } from '@/components/auth/RequiredAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MonitoredVolunteer, GroupChat, AssignedTask } from '@/types';
import { LayoutDashboard, Users, Filter, Search as SearchIcon, MessageSquarePlus, MessageSquare, Eye, CheckCircle, XCircle, UserPlus, ListOrdered, PlusCircle, ListTodo } from 'lucide-react';
import { CreateGroupChatForm, type CreateGroupChatFormData } from '@/components/forms/CreateGroupChatForm';
import { INTEREST_AREAS } from '@/lib/constants'; // Import INTEREST_AREAS
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';

// Use INTEREST_AREAS for labels
function getInterestLabel(interestKey: string): string {
  const foundArea = INTEREST_AREAS.find(area => area.id === interestKey);
  return foundArea ? foundArea.label : interestKey.charAt(0).toUpperCase() + interestKey.slice(1).replace(/_/g, ' ');
}

function getStatusColor(status: MonitoredVolunteer['status']): string {
  switch (status) {
    case 'Active':
      return 'bg-green-500';
    case 'Pending':
      return 'bg-yellow-500';
    case 'Inactive':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

function getTaskStatusVariant(status: AssignedTask['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'Completed': return 'default';
        case 'In Progress': return 'secondary';
        case 'To Do': return 'destructive';
        default: return 'outline';
    }
}

export default function CandidateDashboardPage() {
  const {  token } = useAuth(); // Assuming candidate name is on user object
  const { toast } = useToast();
  const [volunteers, setVolunteers] = useState<MonitoredVolunteer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [interestFilter, setInterestFilter] = useState('all');
  const [isCreateGroupChatOpen, setIsCreateGroupChatOpen] = useState(false);
  const [createdGroupChats, setCreatedGroupChats] = useState<GroupChat[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState<{ title: string; volunteerId: string }>({ title: '', volunteerId: '' });

  const uniqueInterests = useMemo(() => {
    return ['all', ...INTEREST_AREAS.map(area => area.id)];
  }, []);


   useEffect(()=>{
    if(!token){
       return;
    }

    const getAllVolunteers = async()=>{
      const response =await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/volunteer`,{
        headers:{
            "Authorization": `Bearer ${token}`,
        }
      });

      if(response.data.success){
        setVolunteers(response.data.volunteers)
      }
    }

    getAllVolunteers();

   },[token]);


  // Volunteers for the main roster (Active)
  const activeVolunteers = useMemo(() => {
     
    return volunteers.filter(volunteer => {
      const matchesSearch =
        volunteer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (volunteer.phone && volunteer.phone.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesInterest = interestFilter === 'all' || volunteer.interests.includes(interestFilter);
      return volunteer.status === 'Active' && matchesSearch && matchesInterest;
    });
  }, [volunteers, searchTerm, interestFilter]);

  // Volunteers for the request queue (Pending Review for this candidate)
  const pendingRequests = useMemo(() => {
    // In a real app, user.name would come from the signed-in candidate's profile

    return volunteers.filter(v => 
        v.status === 'Pending'  && 
        v.volunteerTarget === 'candidate'
    );
  }, [volunteers]);


  const handleCreateGroupChat = (formData: CreateGroupChatFormData) => {
    const newGroupChat: GroupChat = {
      id: `gc-${Date.now()}`,
      name: formData.groupName,
      candidateId: 'current-candidate-id', 
      volunteerMemberIds: formData.volunteerIds,
      createdAt: new Date().toISOString(),
    };
    setCreatedGroupChats(prev => [...prev, newGroupChat]);
    console.log('New Group Chat Created:', newGroupChat);
    setIsCreateGroupChatOpen(false); 
  };

  const handleRequestAction = async(volunteerId: string, action: 'accept' | 'reject') => {

    const status =  action === 'accept' ? 'Active' : 'Inactive';

    const response = await axios.patch(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/volunteer/${volunteerId}/status`, { status },{
        headers:{
            "Authorization": `Bearer ${token}`
        }
    });

    if(response.data.success){
        setVolunteers(prev => prev.map(v => {
          if (v._id === volunteerId) {
            return { ...v, status };
          }
          return v;
        }));
        toast({
          title: `Request ${action === 'accept' ? 'Accepted' : 'Rejected'}`,
          description: `The volunteer has been moved to the appropriate list.`,
        });
    }

  };

  // Task action

  useEffect(()=>{
    if(!token){
       return;
    }

    const getAllTask = async()=>{
      const response =await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/task`,{
        headers:{
            "Authorization": `Bearer ${token}`,
        }
      });

      if(response.data.success){
        setAssignedTasks(response.data.tasks)
      }
    }

    getAllTask();

   },[token]);

  const handleAssignTask = async() => {
    if (!newTask.title || !newTask.volunteerId) {
        toast({ title: 'Error', description: 'Please provide a task title and select a volunteer.', variant: 'destructive' });
        return;
    }
    const volunteer = activeVolunteers.find(v => v._id === newTask.volunteerId);
    if (!volunteer) return;

    const response = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/task`,{
        title: newTask.title,
        volunteerId: volunteer._id,
        volunteerName: volunteer.fullName,
        assignedAt: new Date().toISOString(),
    },{
        headers:{
            'Authorization':`Bearer ${token}`
        }
    });

    if(response.data.success){
        const { task } = response.data;
        setAssignedTasks(prev => [task, ...prev]);
        toast({ title: 'Task Assigned!', description: `Task "${newTask.title}" assigned to ${volunteer.fullName}.`});
        setIsAssignTaskOpen(false);
        setNewTask({ title: '', volunteerId: '' });
    }

  };

  return (
    <RequiredAuth allowedRoles={['CANDIDATE']} redirectTo='/'>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center">
            <LayoutDashboard className="mr-3 h-7 w-7 text-primary" />
            Candidate Dashboard
            </h1>
        </div>
        <p className="text-muted-foreground">
          Monitor volunteers, manage communications, and organize your campaign efforts.
        </p>

        <Tabs defaultValue="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="requests">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Volunteer Requests ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="roster">
                    <Users className="mr-2 h-4 w-4" />
                    Active Roster
                </TabsTrigger>
                <TabsTrigger value="tasks">
                    <ListTodo className="mr-2 h-4 w-4" />
                    Assigned Tasks ({assignedTasks.length})
                </TabsTrigger>
                <TabsTrigger value="chats">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Group Chats
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="requests" className="mt-4">
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <UserPlus className="mr-2 h-5 w-5 text-primary" />
                            Volunteer Requests for Your Campaign
                        </CardTitle>
                        <CardDescription>Review and approve volunteers who have signed up to help you directly.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Interests</TableHead>
                                        <TableHead>Availability</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingRequests.length > 0 ? (
                                        pendingRequests.map(req => (
                                            <TableRow key={req._id}>
                                                <TableCell className="font-medium">{req.fullName}</TableCell>
                                                <TableCell>{req.phone || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {req.interests.map(interestKey => (
                                                        <Badge key={interestKey} variant="secondary" className="text-xs">
                                                            {getInterestLabel(interestKey)}
                                                        </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{req.availability}</TableCell>
                                                <TableCell className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleRequestAction(req._id, 'accept')}>
                                                        <CheckCircle className="h-4 w-4 mr-1 text-green-500"/> Accept
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleRequestAction(req._id, 'reject')}>
                                                        <XCircle className="h-4 w-4 mr-1 text-red-500"/> Reject
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No new volunteer requests at this time.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="roster" className="mt-4">
                <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Active Volunteer Roster
                    </CardTitle>
                    <CardDescription>View and filter your active volunteers. Select them to add to group chats.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-card">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        aria-label="Search volunteers"
                        />
                    </div>
                    <Select value={interestFilter} onValueChange={setInterestFilter}>
                        <SelectTrigger aria-label="Filter by interest">
                        <SelectValue placeholder="Filter by Interest" />
                        </SelectTrigger>
                        <SelectContent>
                        {uniqueInterests.map(interestKey => (
                            <SelectItem key={interestKey} value={interestKey}>
                            {interestKey === 'all' ? 'All Interests' : getInterestLabel(interestKey)}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden md:table-cell">Phone</TableHead>
                            <TableHead>Interests</TableHead>
                            <TableHead className="hidden lg:table-cell">Availability</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {activeVolunteers.length > 0 ? (
                            activeVolunteers.map(volunteer => (
                            <TableRow key={volunteer._id}>
                                <TableCell className="font-medium">{volunteer.fullName}</TableCell>
                                <TableCell className="hidden md:table-cell">{volunteer.phone || 'N/A'}</TableCell>
                                <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {volunteer.interests.map(interestKey => (
                                    <Badge key={interestKey} variant="secondary" className="text-xs">
                                        {getInterestLabel(interestKey)}
                                    </Badge>
                                    ))}
                                </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">{volunteer.availability}</TableCell>
                                <TableCell>
                                <Badge
                                    className={`text-white text-xs ${getStatusColor(volunteer.status)}`}
                                >
                                    {volunteer.status}
                                </Badge>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No active volunteers found matching your criteria.
                            </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </div>
                    {activeVolunteers.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-4">
                            Displaying {activeVolunteers.length} of {volunteers.filter(v=>v.status === 'Active').length} total active volunteers.
                        </p>
                    )}
                </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="tasks" className="mt-4">
                <Card className="shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Task Management</CardTitle>
                            <CardDescription>Assign and track tasks for your volunteers.</CardDescription>
                        </div>
                        <Dialog open={isAssignTaskOpen} onOpenChange={setIsAssignTaskOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Assign New Task
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Assign a New Task</DialogTitle>
                                    <DialogDescription>Fill out the details below to assign a task to an active volunteer.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div>
                                        <Label htmlFor="task-title">Task Title</Label>
                                        <Textarea id="task-title" value={newTask.title} onChange={(e) => setNewTask(prev => ({...prev, title: e.target.value}))} placeholder="e.g., Make 50 get-out-the-vote calls" />
                                    </div>
                                    <div>
                                        <Label htmlFor="task-volunteer">Assign To</Label>
                                        <Select value={newTask.volunteerId} onValueChange={(value) => setNewTask(prev => ({...prev, volunteerId: value}))}>
                                            <SelectTrigger id="task-volunteer">
                                                <SelectValue placeholder="Select a volunteer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {activeVolunteers.map(v => (
                                                    <SelectItem key={v._id} value={v._id}>{v.fullName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAssignTaskOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAssignTask}>Assign Task</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Assigned On</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignedTasks.length > 0 ? (
                                    assignedTasks.map(task => (
                                        <TableRow key={task._id}>
                                            <TableCell className="font-medium">{task.title}</TableCell>
                                            <TableCell>{task.volunteerName}</TableCell>
                                            <TableCell>
                                                <Badge variant={getTaskStatusVariant(task.status)}>{task.status}</Badge>
                                            </TableCell>
                                            <TableCell>{new Date(task.assignedAt).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No tasks assigned yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="chats" className="mt-4">
                 <Card className="shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Group Chats</CardTitle>
                            <CardDescription>Manage your volunteer communication channels.</CardDescription>
                        </div>
                         <Dialog open={isCreateGroupChatOpen} onOpenChange={setIsCreateGroupChatOpen}>
                            <DialogTrigger asChild>
                                <Button>
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
                                    volunteers={volunteers.filter(v => v.status === 'Active')} 
                                    onSubmitSuccess={handleCreateGroupChat}
                                    onOpenChange={setIsCreateGroupChatOpen}
                                />
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {createdGroupChats.length > 0 ? (
                             <ul className="space-y-2">
                                {createdGroupChats.map(chat => (
                                    <li key={chat.id} className="text-sm p-3 border rounded-md hover:bg-muted/50 transition-colors">
                                        <Link href={`/chat/${chat.id}?name=${encodeURIComponent(chat.name)}`} className="flex justify-between items-center">
                                        <div>
                                            <span className="font-semibold">{chat.name}</span>
                                            <span className="text-muted-foreground"> ({chat.volunteerMemberIds.length} member(s))</span>
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
            </TabsContent>
        </Tabs>
      </div>
    </RequiredAuth>
  );
}

    