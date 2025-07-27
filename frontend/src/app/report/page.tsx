// 'use client';

// import { useState } from 'react';
// import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { AlertTriangle, CheckCircle, FileUp, Loader2, ListChecks } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import type { Report } from '@/types';
// import { mockReports } from '@/lib/mockData'; 
// import { format } from 'date-fns';

// const reportSchema = z.object({
//   title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
//   description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description cannot exceed 2000 characters'),
//   category: z.enum(['Candidate Behavior', 'False Information', 'Election Process', 'Other']),
//   attachment: z.any().optional(),
//   isAnonymous: z.boolean().default(false),
// });

// type ReportFormData = z.infer<typeof reportSchema>;

// export default function ReportIssuePage() {
//   const { toast } = useToast();
//   const [isLoading, setIsLoading] = useState(false);
//   const [submittedReports, setSubmittedReports] = useState<Report[]>(mockReports); 

//   const form = useForm<ReportFormData>({
//     resolver: zodResolver(reportSchema),
//     defaultValues: {
//       isAnonymous: false,
//       category: undefined,
//     },
//   });

//   const onSubmit: SubmitHandler<ReportFormData> = async (data) => {
//     setIsLoading(true);

//     await new Promise(resolve => setTimeout(resolve, 1500));
    
//     const newReport: Report = {
//       id: `rep${Date.now()}`,
//       title: data.title,
//       description: data.description,
//       category: data.category,
//       status: 'Submitted',
//       dateSubmitted: new Date().toISOString(),
//       isAnonymous: data.isAnonymous,
//     };
//     setSubmittedReports(prev => [newReport, ...prev]);

//     setIsLoading(false);
//     toast({
//       title: 'Report Submitted',
//       description: 'Thank you for your submission. We will review it shortly.',
//       variant: 'default',
//       action: <CheckCircle className="text-green-500" />,
//     });
//     form.reset();
//   };

//   return (
//     <div className="space-y-8">
//       <div>
//         <h1 className="text-2xl font-bold mb-2 flex items-center">
//           <AlertTriangle className="mr-3 h-7 w-7 text-primary" />
//           Report an Issue
//         </h1>
//         <p className="text-muted-foreground">
//           Help maintain the integrity of elections by reporting issues, misconduct, or false information.
//         </p>
//       </div>

//       <Card className="shadow-lg">
//         <CardHeader>
//           <CardTitle>Submit a New Report</CardTitle>
//           <CardDescription>Please provide as much detail as possible.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             <div>
//               <Label htmlFor="title">Report Title</Label>
//               <Input id="title" {...form.register('title')} placeholder="e.g., Misleading Campaign Flyer" />
//               {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
//             </div>

//             <div>
//               <Label htmlFor="category">Category</Label>
//               <Controller
//                 name="category"
//                 control={form.control}
//                 render={({ field }) => (
//                   <Select onValueChange={field.onChange} defaultValue={field.value}>
//                     <SelectTrigger id="category">
//                       <SelectValue placeholder="Select a category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Candidate Behavior">Candidate Behavior</SelectItem>
//                       <SelectItem value="False Information">False Information</SelectItem>
//                       <SelectItem value="Election Process">Election Process</SelectItem>
//                       <SelectItem value="Other">Other</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {form.formState.errors.category && <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>}
//             </div>
            
//             <div>
//               <Label htmlFor="description">Description</Label>
//               <Textarea id="description" {...form.register('description')} placeholder="Detailed description of the issue..." className="min-h-[120px]" />
//               {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
//             </div>

//             <div>
//               <Label htmlFor="attachment">Attach Photo/Video (Optional)</Label>
//               <div className="flex items-center gap-2 p-2 border rounded-md border-dashed hover:border-primary transition-colors">
//                 <FileUp className="h-5 w-5 text-muted-foreground" />
//                 <Input id="attachment" type="file" {...form.register('attachment')} className="text-sm border-none shadow-none p-0 h-auto file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-muted file:text-muted-foreground hover:file:bg-primary/10" />
//               </div>
//               <p className="text-xs text-muted-foreground mt-1">Max file size: 5MB. Accepted formats: JPG, PNG, MP4.</p>
//             </div>

//             <div className="flex items-center space-x-2">
//               <Controller
//                 name="isAnonymous"
//                 control={form.control}
//                 render={({ field }) => (
//                     <Checkbox id="isAnonymous" checked={field.value} onCheckedChange={field.onChange} />
//                 )}
//               />
//               <Label htmlFor="isAnonymous" className="text-sm font-normal">Submit Anonymously</Label>
//             </div>

//             <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
//               {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
//               Submit Report
//             </Button>
//           </form>
//         </CardContent>
//       </Card>

//       <Card className="shadow-lg">
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <ListChecks className="mr-2 h-5 w-5 text-primary" />
//             Track Report Status
//           </CardTitle>
//           <CardDescription>View the status of your submitted reports.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {submittedReports.length > 0 ? (
//             <ul className="space-y-4">
//               {submittedReports.map(report => (
//                 <li key={report.id} className="p-3 border rounded-md bg-secondary/30">
//                   <h4 className="font-semibold">{report.title}</h4>
//                   <p className="text-xs text-muted-foreground">
//                     Category: {report.category} | Submitted: {format(new Date(report.dateSubmitted), "MMM d, yyyy")}
//                     {report.isAnonymous && " (Anonymous)"}
//                   </p>
//                   <p className={`text-sm font-medium mt-1 ${
//                     report.status === 'Resolved' ? 'text-green-600' : 
//                     report.status === 'In Review' ? 'text-yellow-600' : 
//                     report.status === 'Rejected' ? 'text-red-600' : 'text-primary'
//                   }`}>
//                     Status: {report.status}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-center text-muted-foreground py-4">You have not submitted any reports yet.</p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
