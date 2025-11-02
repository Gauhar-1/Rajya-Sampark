import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CookingPot, ThumbsUp, Users } from "lucide-react"
import { useVolunteer } from "../hooks/use-volunteer"
import * as util from "../utils/index"

export const Issues = ()=>{
    const { activeVolunteers } = useVolunteer();
    return(
         <Card className="shadow-md">
                <CardHeader className='text-primary'>
                    <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Active Issue Requests
                    </CardTitle>
                    <CardDescription>View and Accept your issues sent by your volunteer.</CardDescription>
                </CardHeader>
                <CardContent className='bg-primary border-4 border-black m-2 p-2 rounded-lg'>
                    <div className="overflow-x-auto">
                    <Table className='border-4 bg-white border-black m-1'>
                        <TableHeader className=''>
                        <TableRow>
                            <TableHead className='flex justify-center items-center'>Issue Id</TableHead>
                            <TableHead className="md:table-cell flex justify-center items-center">Taken By</TableHead>
                            <TableHead className='flex justify-center items-center'>Time</TableHead>
                            <TableHead className="flex justify-center items-center lg:table-cell">Post</TableHead>
                            <TableHead className='flex justify-center items-center'>Action</TableHead>
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
                                        {util.getInterestLabel(interestKey)}
                                    </Badge>
                                    ))}
                                </div>
                                </TableCell>
                                <TableCell className="">
                                    <Button className='text-primary border-2 border-primary  hover:text-white hover:bg-primary bg-white m-6 rounded-lg'>
                                       View
                                    </Button>
                                </TableCell>
                                <TableCell className='flex'>
                                    <Button className='text-green-600 hover:text-white hover:bg-green-600 bg-white m-6 rounded-lg'>
                                       <ThumbsUp />
                                    </Button>
                                    <Button className='text-red-600 hover:text-white hover:bg-red-600 bg-white m-6 rounded-lg'>
                                       <CookingPot />
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                            <TableCell colSpan={6} className="text-center hover:text-white text-black">
                                No active issues found.
                            </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </div>
                    {/* {activeVolunteers.length > 0 && (
                        <p className="text-sm text-gray-300 mt-4">
                            Displaying {activeVolunteers.length} of {volunteers.filter(v=>v.status === 'Active').length} total active issues.
                        </p>
                    )} */}
                </CardContent>
                </Card>
    )
}