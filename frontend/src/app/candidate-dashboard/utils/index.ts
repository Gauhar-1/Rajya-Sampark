import { INTEREST_AREAS } from "@/lib/constants";
import { AssignedTask, MonitoredVolunteer } from "@/types";

// Use INTEREST_AREAS for labels
 export function getInterestLabel(interestKey: string): string {
  const foundArea = INTEREST_AREAS.find(area => area.id === interestKey);
  return foundArea ? foundArea.label : interestKey.charAt(0).toUpperCase() + interestKey.slice(1).replace(/_/g, ' ');
}

export function getStatusColor(status: MonitoredVolunteer['status']): string {
  switch (status) {
    case 'Active':
      return 'bg-green-500';
    case 'Pending':
      return 'bg-yellow-500';
    case 'Inactive':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function getTaskStatusVariant(status: AssignedTask['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'Completed': return 'default';
        case 'In Progress': return 'secondary';
        case 'To Do': return 'destructive';
        default: return 'outline';
    }
}

