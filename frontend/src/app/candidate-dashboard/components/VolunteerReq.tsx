import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, UserPlus, XCircle } from "lucide-react"
import { useVolunteer } from "../hooks/use-volunteer"
import * as util from "../utils/index"

export const VolunteerReq = ()=>{
    const { pendingRequests, handleRequestAction, loading: VolunteerLoading } = useVolunteer();

    return (
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
                                    {VolunteerLoading ? <TableRow>
                                            <TableCell colSpan={5} className="text-center hover:text-white text-primary ">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    : pendingRequests.length > 0 ? (
                                        pendingRequests.map(req => (
                                            <TableRow key={req._id}>
                                                <TableCell className="font-medium">{req.fullName}</TableCell>
                                                <TableCell>{req.phone || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {req.interests.map(interestKey => (
                                                        <Badge key={interestKey} variant="secondary" className="text-xs">
                                                            {util.getInterestLabel(interestKey)}
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
    )
}