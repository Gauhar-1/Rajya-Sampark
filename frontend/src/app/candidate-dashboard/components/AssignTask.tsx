import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import { NewTask } from "../types"
import { useAssignTask } from "../hooks/use-Assig-task"
import * as util from '../utils/index';
import { useVolunteer } from "../hooks/use-volunteer"

export const AssignTask = ()=>{
    const [newTask, setNewTask] = useState<NewTask>({ title: '', volunteerId: '' });
    const { assignedTasks, isAssignTaskOpen, setIsAssignTaskOpen, handleAssignTask, loading : taskLoading } = useAssignTask();
    const { activeVolunteers } = useVolunteer();

    return (
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
                                    <Button onClick={() =>handleAssignTask(newTask)}className='bg-primary'>Assign Task</Button>
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
                                { taskLoading ? <TableRow>
                                        <TableCell colSpan={4} className="text-center hover:text-white text-primary">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                : assignedTasks.length > 0 ? (
                                    assignedTasks.map(task => (
                                        <TableRow className='border-2  border-gray-300 ' key={task._id}>
                                            <TableCell className="font-medium">{task.title}</TableCell>
                                            <TableCell>{task.volunteerName}</TableCell>
                                            <TableCell>
                                                <Badge variant={util.getTaskStatusVariant(task.status)}>{task.status}</Badge>
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
    )
}