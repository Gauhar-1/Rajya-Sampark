import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MonitoredVolunteer } from "@/types";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

export const useVolunteer = ()=>{
    const { token } = useAuth();
    const { toast } = useToast();
    const [volunteers, setVolunteers] = useState<MonitoredVolunteer[]>([]);
    const [ loading, setIsLoading ] = useState<Boolean>(false);

    useEffect(()=>{
    if(!token){
       return;
    }

    const getAllVolunteers = async()=>{
        setIsLoading(true);
        try{
           const response =await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/volunteer`,{
             headers:{
                    "Authorization": `Bearer ${token}`,
                    }
            });

            if(response.data.success){
            setVolunteers(response.data.volunteers)
             }
        }
        catch(err){
            console.error("Error found while fetching the volunteer", err);
        }
        finally{
            setIsLoading(false);
        }
      
    }

    getAllVolunteers();

   },[token]);


  // Volunteers for the main roster (Active)
  const activeVolunteers = useMemo(() => {
    return volunteers.filter(volunteer => {
      return volunteer.status === 'Active' ;
    });
  }, [volunteers]);


//   const activeVolunteers = (searchTerm : string, interestFilter: string) =>useMemo(() => {
//     return volunteers.filter(volunteer => {
//       const matchesSearch =
//         volunteer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (volunteer.phone && volunteer.phone.toLowerCase().includes(searchTerm.toLowerCase()));
//       const matchesInterest = interestFilter === 'all' || volunteer.interests.includes(interestFilter);
//       return volunteer.status === 'Active' && matchesSearch && matchesInterest;
//     });
//   }, [volunteers]);

  const pendingRequests = useMemo(() => {

    return volunteers.filter(v => 
        v.status === 'Pending'  && 
        v.volunteerTarget === 'candidate'
    );
  }, [volunteers]);

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

    return {
        volunteers,
        handleRequestAction,
        pendingRequests,
        activeVolunteers,
        Pending_Count : pendingRequests.length,
        loading
    }
}