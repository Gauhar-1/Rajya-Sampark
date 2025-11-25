import { useAuth } from "@/contexts/AuthContext";
import { Issue, issueStatus } from "@/types";
import axios from "axios";
import { useEffect, useState } from "react";


export const useIssue = () => {
    const { token } = useAuth();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setIsLoading] = useState<Boolean>(false);

    const apiHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    useEffect(() => {
        if (!token) return;

        const getIssue = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/issue/candidate`, {
                    headers: apiHeaders
                });

                if (response.data.success) {
                    setIssues(response.data.data?.issues || response.data.issues);
                }
            }
            catch (err) {
                console.error("Error found while getting the Issues", err);
            }
            finally {
                setIsLoading(false);
            }
        }
        getIssue();
    }, [token])


    const handleStatusChange = async (issueId: string, status: issueStatus) => {
        console.log(`Attempting to accept issue: ${issueId}`);
        try {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/post/issue/${issueId}/status`, { status }, { headers: apiHeaders });

            if (response.data.success) {
                setIssues(prev =>
                    prev.map(issue =>
                        issue._id === issueId ? { ...issue, status } : issue
                    )
                );
            }
        } catch (error) {
            console.error(`Error accepting issue ${issueId}:`, error);
        }
    };


    // const handleCreateGroupChat = async (issueId : string) => {
    //     console.log(`Attempting to create group chat for issue: ${issueId}`);
    //     try {
    //         // Placeholder API call: The backend handles leader selection and chat room creation
    //         const response = await axios.post(`${API_BASE_URL}/${issueId}/create-chat`, { issueId }, { headers: apiHeaders });

    //         // On success, notify user or navigate to the chat (assuming API returns chat info)
    //         console.log(`Group chat created successfully for issue ${issueId}. Chat ID: ${response.data.chatId}`);
    //         // Example: navigateToChat(response.data.chatId);
    //     } catch (error) {
    //         console.error(`Error creating group chat for issue ${issueId}:`, error);
    //         // Implement user-facing error notification here
    //     }
    // };

    return { handleStatusChange, issues, loading };
}