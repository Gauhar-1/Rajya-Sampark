import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CookingPot, ThumbsUp, Users, Handshake, Eye } from "lucide-react";
import { useIssue } from '../hooks/use-issue';
import { Issue } from '@/types';
import Link from 'next/link';



export const Issues = () => { // Removed 'export' keyword here
    const { issues, loading : IssueLoading, handleStatusChange } = useIssue();
    console.log("Issues", issues);

    const handleView = (issueId: string) => {
        console.log(`Viewing details for issue: ${issueId}`);
    };


    const handleCreateGroupChat = (issueId : string) => {
        console.log(`Initiating Group Chat for issue: ${issueId}`);
    };

    const renderActionButtons = (issue : Issue) => {
        if (issue.status === 'approved') {
            return (
                <Button 
                    className='text-primary border-2 border-primary hover:text-white hover:bg-primary bg-white rounded-lg flex items-center justify-center p-2 h-auto'
                    onClick={() => handleCreateGroupChat(issue._id)}
                >
                    <Handshake className="h-5 w-5 mr-1" /> Group Chat
                </Button>
            );
        }

        if (issue.status === 'rejected') {
            return (
                <Badge variant="destructive" className="bg-red-500/10 text-red-600 border border-red-600">Rejected</Badge>
            );
        }

        return (
            <div className='flex space-x-2'>
                <Button 
                    className='text-green-600 border-2 border-green-600 hover:text-white hover:bg-green-600 bg-white rounded-lg p-2 h-auto'
                    onClick={() => handleStatusChange(issue._id, "approved")}
                >
                    <ThumbsUp className="h-5 w-5" />
                </Button>
                <Button 
                    className='text-red-600 border-2 border-red-600 hover:text-white hover:bg-red-600 bg-white rounded-lg p-2 h-auto'
                    onClick={() => handleStatusChange(issue._id, "rejected")}
                >
                    <CookingPot className="h-5 w-5" />
                </Button>
            </div>
        );
    };

    return(
        <Card className="shadow-md">
            <CardHeader className='text-primary'>
                <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Active Issue Requests
                </CardTitle>
                <CardDescription>View and manage issues taken by volunteers. Approve or reject requests to proceed.</CardDescription>
            </CardHeader>
            <CardContent className='bg-primary border-4 border-black m-2 p-2 rounded-lg'>
                <div className="overflow-x-auto">
                    <Table className='border-4 bg-white border-black m-1'>
                        <TableHeader>
                            <TableRow>
                                {/* Reverted Headers as requested */}
                                <TableHead className='flex justify-center items-center'>Issue No.</TableHead>
                                <TableHead className="md:table-cell flex justify-center items-center">Taken By</TableHead>
                                <TableHead className='flex justify-center items-center'>Time</TableHead>
                                <TableHead className="flex justify-center items-center lg:table-cell">Post</TableHead>
                                <TableHead className='flex justify-center items-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            { IssueLoading ?  <TableRow>
                                    <TableCell colSpan={5} className="text-center hover:text-white text-primary">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            : issues.length > 0 ? (
                                issues.map((issue , index) => (
                                    <TableRow key={index}>
                                        
                                        <TableCell className="font-medium">
                                            **#{index + 1}** 
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell ">
                                            <Badge variant="outline" className='hover:bg-white'>{issue.takenBy.phone}</Badge>
                                        </TableCell>

                                        <TableCell>{(issue.createdAt)}</TableCell>

                                        <TableCell className="lg:table-cell">
                                            <Link href={`/post/${issue.postId}`}>
                                            <Button 
                                                className='text-primary border-2 border-primary hover:text-white hover:bg-primary bg-white rounded-lg p-2 h-auto'
                                                onClick={() => handleView(issue._id)}
                                            >
                                                <Eye className='h-4 w-4 mr-1'/> View
                                            </Button>
                                            </Link>
                                        </TableCell>

                                        <TableCell>
                                            {renderActionButtons(issue)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-black">
                                        No active issues found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

