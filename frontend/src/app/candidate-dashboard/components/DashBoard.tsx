import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MyTree from "@/components/ui/treemap"
import { BarChart, BubbleChart, LineChart, StackedBarChat } from "@/hooks/use-charts"
import { LayoutDashboard } from "lucide-react"

export const Dashboard = ()=>{
    return (
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
                                    <div className='text-xl font-bold'>600</div>
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
    )
}