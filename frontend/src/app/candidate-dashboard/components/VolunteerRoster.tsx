import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { INTEREST_AREAS } from "@/lib/constants"
import { SearchIcon, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { useVolunteer } from "../hooks/use-volunteer"
import * as util from '../utils/index'

export const VolunteerRoster =()=>{
    const [searchTerm, setSearchTerm] = useState('');
    const [interestFilter, setInterestFilter] = useState('all');
    const { activeVolunteers, loading: VolunteerLoading } = useVolunteer();

    const uniqueInterests = useMemo(() => {
      return ['all', ...INTEREST_AREAS.map(area => area.id)];
    }, []);

    return (
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
                            {interestKey === 'all' ? 'All Interests' : util.getInterestLabel(interestKey)}
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
                        {VolunteerLoading ? <TableRow>
                            <TableCell colSpan={6} className="text-center text-black">
                                Loading...
                            </TableCell>
                            </TableRow> : activeVolunteers.length > 0 ? (
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
                                <TableCell className="hidden lg:table-cell">{volunteer.availability}</TableCell>
                                <TableCell>
                                <Badge
                                    className={`text-white text-xs ${util.getStatusColor(volunteer.status)}`}
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
                            {/* Displaying {activeVolunteers.length} of {volunteers.filter(v=>v.status === 'Active').length} total active volunteers. */}
                        </p>
                    )}
                </CardContent>
                </Card>
    )
}