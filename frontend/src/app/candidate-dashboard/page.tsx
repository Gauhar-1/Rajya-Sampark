
'use client';

import { RequiredAuth } from '@/components/auth/RequiredAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Users, MessageSquare, UserPlus, ListTodo } from 'lucide-react';
import { useAssignTask } from './hooks/use-Assig-task';
import { AssignTask } from './components/AssignTask';
import { VolunteerReq } from './components/VolunteerReq';
import { VolunteerRoster } from './components/VolunteerRoster';
import { useVolunteer } from './hooks/use-volunteer';
import { GroupChat } from './components/GroupChat';
import { Issues } from './components/Issues';
import { Dashboard } from './components/DashBoard';


export default function CandidateDashboardPage() {
  const {  Tasks_Count } = useAssignTask();
  const { Pending_Count } = useVolunteer();

  return (
    <RequiredAuth allowedRoles={['CANDIDATE', 'ADMIN']} redirectTo='/'>
      <div className="p-2 bg-primary rounded-lg">
        <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="dashboard" className=''>
                  <LayoutDashboard className="mr-2 h-4 w-4"/>
                   Dashboard
                </TabsTrigger>
                <TabsTrigger value="requests">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Volunteer Requests ({Pending_Count})
                </TabsTrigger>
                <TabsTrigger value="roster">
                    <Users className="mr-2 h-4 w-4" />
                    Active Roster
                </TabsTrigger>
                <TabsTrigger value="issues">
                    <Users className="mr-2 h-4 w-4" />
                    Issues Requests
                </TabsTrigger>
                <TabsTrigger value="tasks">
                    <ListTodo className="mr-2 h-4 w-4" />
                    Assigned Tasks ({Tasks_Count})
                </TabsTrigger>
                <TabsTrigger value="chats">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Group Chats
                </TabsTrigger>
            </TabsList>

            <TabsContent value='dashboard' className='mt-4'>
               <Dashboard /> 
            </TabsContent>
            
            <TabsContent value="requests" className="mt-4">
                <VolunteerReq />
            </TabsContent>

            <TabsContent value="roster" className="mt-4">
                <VolunteerRoster />
            </TabsContent>

            <TabsContent value="issues" className="mt-4">
               <Issues />
            </TabsContent>

             <TabsContent value="tasks" className="mt-4">
               <AssignTask />
            </TabsContent>

            <TabsContent value="chats" className="mt-4">
                 <GroupChat />
            </TabsContent>
        </Tabs>
      </div>
    </RequiredAuth>
  );
}

    