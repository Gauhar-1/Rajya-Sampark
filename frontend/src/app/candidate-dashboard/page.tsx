
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
import { LineChart , BarChart, StackedBarChat, BubbleChart} from '@/hooks/use-charts';
import MyTree from '@/components/ui/treemap';

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

  const pendingRequests = useMemo(() => {

    return volunteers.filter(v => 
        v.status === 'Pending'  && 
        v.volunteerTarget === 'candidate'
    );
  }, [volunteers]);

  // Group chats

  useEffect(()=>{
    const fetchGroups = async()=>{
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
        console.log("Error found while creating group" ,err);
    }
    finally{
        setIsCreateGroupChatOpen(false); 
    }
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
    <RequiredAuth allowedRoles={['CANDIDATE', 'ADMIN']} redirectTo='/'>
      <div className="p-2 bg-primary rounded-lg">
        <Tabs defaultValue="dashboard" className="w-full ">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="dashboard" className=''>
                   Dashboard
                </TabsTrigger>
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

            <TabsContent value='dashboard' className='mt-4'>
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className='flex items-center text-primary'>
                             <LayoutDashboard className="mr-3 h-7 w-7 " />
                            Candidate Dashboard
                        </CardTitle>
                        <CardDescription>
                            Monitor, Manage And Organize your Efforts!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className=' grid grid-cols-5 gap-2 p-2 rounded-md'>
                            <Card className='text-white border-4 border-black bg-foreground flex flex-col items-center'>
                                <CardTitle className='text-lg py-2'>
                                    Total Votes
                                </CardTitle>
                                <CardContent className=''>
                                    <div className='text-xl font-bold'>10</div>
                                </CardContent>
                            </Card>
                            <Card className='text-white border-4 border-black bg-foreground flex flex-col items-center'>
                                <CardTitle className='text-lg p-2'>
                                    Target
                                </CardTitle>
                                <CardContent className=''>
                                    <div className='text-xl font-bold'>50</div>
                                </CardContent>
                            </Card>
                            <Card className='text-white border-4 border-black bg-foreground flex flex-col items-center'>
                                <CardTitle className='text-lg p-2'>
                                    Achieved
                                </CardTitle>
                                <CardContent className=''>
                                    <div className='text-xl font-bold'>3</div>
                                </CardContent>
                            </Card>
                            <Card className='text-white border-4 border-black bg-foreground flex flex-col items-center'>
                                <CardTitle className='text-lg p-2'>
                                    Active Leaders
                                </CardTitle>
                                <CardContent className=''>
                                    <div className='text-xl font-bold'>2</div>
                                </CardContent>
                            </Card>
                            <Card className='text-white border-4 border-black bg-foreground  flex flex-col items-center'>
                                <CardTitle className='text-lg p-2'>
                                    Open Critical Issues
                                </CardTitle>
                                <CardContent className=''>
                                    <div className='text-xl font-bold'>5</div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className=' bg-primary p-1 rounded-md grid grid-cols-8 gap-1 border-4 border-black'>
                           <Card className='grid col-start-0 col-span-4 p-1 border-4 border-black flex-col gap-3'>
                            <CardTitle>Progress Time Series</CardTitle>
                            <CardContent>
                               <LineChart />
                            </CardContent>
                           </Card>

                           <Card className='grid col-start-5 col-span-8 p-2 border-4 border-black flex-col gap-3'>
                            <CardTitle>LeaderBoard</CardTitle>
                            <CardContent>
                                <BarChart />
                            </CardContent>
                           </Card>
                           <Card className='grid col-start-1 col-span-4  border-4 border-black flex-col gap-3'>
                            <CardTitle className='m-2'>Critical Issues feed</CardTitle>
                            <CardContent>
                                <StackedBarChat />
                            </CardContent>
                           </Card>
                           <Card className='grid col-start-5 col-span-8  border-4 border-black flex-col gap-3'>
                            <CardTitle className='m-2'>Resource allocation vs Impact</CardTitle>
                            <CardContent>
                                <BubbleChart />
                            </CardContent>
                           </Card>
                           <Card className='bg-white border-4 col-span-8 border-black h-full rounded-lg p-2 flex flex-col gap-2'>
                                <CardTitle>TreeMap</CardTitle>
                                <CardContent>
                                    <MyTree></MyTree>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="requests" className="mt-4">
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center text-primary">
                            <UserPlus className="mr-2 h-5 w-5 text-primary" />
                            Volunteer Requests for Your Campaign
                        </CardTitle>
                        <CardDescription>Review and approve volunteers who have signed up to help you directly.</CardDescription>
                    </CardHeader>
                    <CardContent className='bg-primary border-4 border-black m-2 rounded-lg p-3'>
                        <div className="overflow-x-auto">
                            <Table className='bg-white'>
                                <TableHeader className='border-4 border-black'>
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
                                            <TableCell colSpan={5} className="text-center text-black ">
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
                <CardHeader className='text-primary'>
                    <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Active Volunteer Roster
                    </CardTitle>
                    <CardDescription>View and filter your active volunteers. Select them to add to group chats.</CardDescription>
                </CardHeader>
                <CardContent className='bg-primary border-4 border-black m-2 p-2 rounded-lg'>
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-2 border-black  rounded-lg bg-primary">
                    <div className="relative border-4 border-black rounded-lg">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground " />
                        <Input
                        type="search"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        aria-label="Search volunteers"
                        />
                    </div>
                    <div className='rounded-lg border-4 border-black'>
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
                    </div>

                    <div className="overflow-x-auto">
                    <Table className='border-4 bg-white border-black m-1'>
                        <TableHeader className=''>
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
                            <TableCell colSpan={6} className="text-center text-black">
                                No active volunteers found matching your criteria.
                            </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </div>
                    {activeVolunteers.length > 0 && (
                        <p className="text-sm text-gray-300 mt-4">
                            Displaying {activeVolunteers.length} of {volunteers.filter(v=>v.status === 'Active').length} total active volunteers.
                        </p>
                    )}
                </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="tasks" className="mt-4">
                <Card className="shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className='text-primary'>
                            <CardTitle>Task Management</CardTitle>
                            <CardDescription>Assign and track tasks for your volunteers.</CardDescription>
                        </div>
                        <Dialog open={isAssignTaskOpen} onOpenChange={setIsAssignTaskOpen}>
                            <DialogTrigger asChild>
                                <Button className='bg-primary'>
                                    <PlusCircle className="mr-2 h-4 w-4 " /> Assign New Task
                                </Button>
                            </DialogTrigger>
                            <DialogContent >
                                <DialogHeader>
                                    <DialogTitle className='text-primary'>Assign a New Task</DialogTitle>
                                    <DialogDescription>Fill out the details below to assign a task to an active volunteer.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className='space-y-1'>
                                        <Label htmlFor="task-title" className='text-primary font-bold'>Task Title</Label>
                                        <Textarea id="task-title" value={newTask.title} onChange={(e) => setNewTask(prev => ({...prev, title: e.target.value}))} placeholder="e.g., Make 50 get-out-the-vote calls" className='border-2 border-primary' />
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <Label htmlFor="task-volunteer" className='text-primary font-bold'>Assign To</Label>
                                        <Select value={newTask.volunteerId} onValueChange={(value) => setNewTask(prev => ({...prev, volunteerId: value}))} >
                                            <SelectTrigger id="task-volunteer">
                                                <SelectValue placeholder="Select a volunteer" className='' />
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
                                    <Button variant="outline" onClick={() => setIsAssignTaskOpen(false)}className='border-2 border-primary text-primary'>Cancel</Button>
                                    <Button onClick={handleAssignTask}className='bg-primary'>Assign Task</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className='bg-primary m-2 rounded-lg border-4 border-black p-3'>
                        <Table className='bg-white'>
                            <TableHeader className=''>
                                <TableRow className='border-4 border-black'>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Assigned On</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className=''>
                                {assignedTasks.length > 0 ? (
                                    assignedTasks.map(task => (
                                        <TableRow className='border-2  border-gray-300 ' key={task._id}>
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
                                        <TableCell colSpan={4} className="text-center text-white">
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
            </TabsContent>
        </Tabs>
      </div>
    </RequiredAuth>
  );
}

    