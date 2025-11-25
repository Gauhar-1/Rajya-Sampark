import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AssignedTask } from "@/types";
import axios from "axios";
import { useEffect, useState } from "react";
import { NewTask } from "../types";


export const useAssignTask = () => {
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [loading, setIsLoading] = useState<Boolean>(false);
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      return;
    }

    const getAllTask = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/task`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });

        if (response.data.success) {
          setAssignedTasks(response.data.data?.tasks || response.data.tasks);
        }
      }
      catch (err) {
        console.log("Error found while fetching the tasks", err);
      }
      finally {
        setIsLoading(false);
      }
    }

    getAllTask();

  }, [token]);

  const handleAssignTask = async (newTask: NewTask) => {
    if (!newTask.title || !newTask.volunteerId) {
      toast({ title: 'Error', description: 'Please provide a task title and select a volunteer.', variant: 'destructive' });
      return;
    }

    const response = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/task`, {
      title: newTask.title,
      volunteerId: newTask.volunteerId,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      const { task } = response.data.data || response.data;
      setAssignedTasks(prev => [task, ...prev]);
      toast({ title: 'Task Assigned!', description: `Task "${newTask.title}" assigned to VOLUNTEER.` });
      setIsAssignTaskOpen(false);
    }

  };

  return {
    assignedTasks,
    handleAssignTask,
    isAssignTaskOpen,
    Tasks_Count: assignedTasks.length,
    setIsAssignTaskOpen,
    loading
  }
}