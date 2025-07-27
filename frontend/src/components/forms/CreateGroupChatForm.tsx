
'use client';

import * as React from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { MonitoredVolunteer } from '@/types';
import { MessageSquarePlus, Loader2 } from 'lucide-react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { INTEREST_AREAS } from '@/lib/constants'; // Import INTEREST_AREAS

const createGroupChatSchema = z.object({
  groupName: z.string().min(3, 'Group name must be at least 3 characters.').max(100),
  selectedInterest: z.string().min(1, 'Please select an interest to filter volunteers.'),
  volunteerIds: z.array(z.string()).min(1, 'Please select at least one volunteer for the group.'),
});

export type CreateGroupChatFormData = z.infer<typeof createGroupChatSchema>;

interface CreateGroupChatFormProps {
  volunteers: MonitoredVolunteer[];
  onSubmitSuccess: (data: CreateGroupChatFormData) => void;
  onOpenChange?: (open: boolean) => void;
}

export function CreateGroupChatForm({ volunteers, onSubmitSuccess, onOpenChange }: CreateGroupChatFormProps) {
  const { toast } = useToast();
  const form = useForm<CreateGroupChatFormData>({
    resolver: zodResolver(createGroupChatSchema),
    defaultValues: {
      groupName: '',
      selectedInterest: '',
      volunteerIds: [],
    },
  });

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form;

  const selectedInterest = watch('selectedInterest');

  // Use the centralized INTEREST_AREAS for the dropdown
  const availableInterests = React.useMemo(() => {
    return INTEREST_AREAS;
  }, []);

  const filteredVolunteers = React.useMemo(() => {
    if (!selectedInterest) return [];
    return volunteers.filter(v => v.interests.includes(selectedInterest) && v.status === 'Active'); // Only active volunteers
  }, [volunteers, selectedInterest]);

  // Reset selected volunteers when interest filter changes
  React.useEffect(() => {
    setValue('volunteerIds', []);
  }, [selectedInterest, setValue]);

  const processSubmit: SubmitHandler<CreateGroupChatFormData> = async (data) => {
    onSubmitSuccess(data);
    toast({
      title: 'Group Chat Drafted!',
      description: `Group "${data.groupName}" with ${data.volunteerIds.length} volunteers.`,
    });
    form.reset();
    onOpenChange?.(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
        <FormField
          control={control}
          name="groupName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Chat Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Canvassing Team Alpha" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="selectedInterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filter Volunteers by Interest</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an interest area" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableInterests.map(interestArea => ( // Use interestArea from constant
                    <SelectItem key={interestArea.id} value={interestArea.id}>
                      {interestArea.label} 
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Active volunteers matching this interest will be shown below.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedInterest && (
          <FormField
            control={control}
            name="volunteerIds"
            render={() => (
              <FormItem>
                <div className="mb-2">
                  <FormLabel>Select Volunteers for "{form.getValues('groupName') || 'New Group'}"</FormLabel>
                  <FormDescription>
                    Found {filteredVolunteers.length} active volunteer(s) for '{INTEREST_AREAS.find(area => area.id === selectedInterest)?.label || selectedInterest}'.
                  </FormDescription>
                </div>
                {filteredVolunteers.length > 0 ? (
                  <ScrollArea className="h-48 rounded-md border p-2">
                    <div className="space-y-2">
                      {filteredVolunteers.map((volunteer) => (
                        <FormField
                          key={volunteer.id}
                          control={control}
                          name="volunteerIds"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 hover:bg-muted/50 rounded-md">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(volunteer.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, volunteer.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (id) => id !== volunteer.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                  {volunteer.fullName} ({volunteer.email})
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">No active volunteers found for this interest.</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isSubmitting || (selectedInterest && filteredVolunteers.length === 0)} className="w-full">
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MessageSquarePlus className="mr-2 h-4 w-4" />
          )}
          {isSubmitting ? 'Creating Group...' : 'Create Group Chat'}
        </Button>
      </form>
    </Form>
  );
}
