
export type Role = 'ADMIN' | 'CANDIDATE' | 'VOLUNTEER' | 'VOTER' | 'ANONYMOUS';

export interface User {
  uid: string;
  phone: string | null;
  email?: string | null;
  role: Role;
  name?: string;
  regionId?: string;
  photoURL?: string | null;
  status: UserStatus
}

export interface Candidate {
  dataAiHint: string;
  _id: string;
  name: string;
  party: string;
  region: string;
  imageUrl?: string;
  keyPolicies: string[];
  manifestoUrl?: string;
  profileBio?: string;
}

interface BaseFeedItem {
  id: string;
  timestamp: string; // ISO string
  creatorName: string; 
  creatorImageUrl?: string;
  creatorDataAiHint?: string;
  likes: number;
  comments: number;
  shares: number;
}

export interface TextPostFeedItem extends BaseFeedItem {
  itemType: 'text_post';
  content: string;
}

export interface ImagePostFeedItem extends BaseFeedItem {
  itemType: 'image_post';
  content?: string; 
  mediaUrl: string; 
  mediaDataAiHint?: string;
}

export interface VideoPostFeedItem extends BaseFeedItem {
  itemType: 'video_post';
  content?: string; 
  mediaUrl: string; 
  mediaDataAiHint?: string;
}

export interface CampaignFeedItem extends BaseFeedItem {
  itemType: 'campaign_created';
  campaignId: string; 
  campaignName: string;
  campaignLocation?: string;
  campaignDescription?: string;
}

export interface PollOption {
  id: string; 
  text: string;
  votes: number;
}

export interface PollFeedItem extends BaseFeedItem {
  itemType: 'poll_created';
  pollId: string; 
  pollQuestion: string;
  pollOptions: PollOption[]; 
  totalVotes: number;
  userHasVoted?: boolean;
}

export type FeedItem = TextPostFeedItem | ImagePostFeedItem | VideoPostFeedItem | CampaignFeedItem | PollFeedItem;


export interface OldFeedPost {
  dataAiHintPost?: string;
  dataAiHintCandidate?: string;
  id: string;
  candidateName: string;
  candidateParty?: string;
  candidateRole?: string;
  candidateImageUrl?: string;
  timestamp: string; 
  content: string;
  postImageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
}


export type ElectionEventType = 'Deadline' | 'Key Event' | 'Election Day';
export interface ElectionEvent {
  id: string;
  title: string;
  date: string; // Keep as string for mock data simplicity, parse when needed
  description: string;
  type: ElectionEventType;
}

export interface Campaign {
  id: string;
  name: string;
  party?: string;
  imageUrl?: string;
  description: string;
  location: string;
  popularityScore: number;
  category: 'Local' | 'State' | 'National';
  createdAt: string;
}


export interface VolunteerSignup {
  _id: string;
  fullName: string;
  phone?: string;
  volunteerTarget: 'general' | 'candidate';
  specificCandidateName?: string;
  interests: string[];
  availability: string;
  message?: string;
  submittedAt: string;
}

export interface MonitoredVolunteer extends VolunteerSignup {
  status: 'Active' | 'Pending' | 'Inactive';
}


export interface Poll {
  id: string;
  question: string;
  options: PollOption[]; 
  creatorId: string;
  createdAt: string;
  regionId?: string;
}

export interface GroupChat {
  id: string;
  name: string;
  candidateId: string; // Assuming a candidate creates/owns the chat
  volunteerMemberIds: string[];
  createdAt: string;
}


export interface FirestoreUser { 
  uid: string;
  phone: string | null;
  email?: string | null;
  name?: string;
  regionId?: string;
  photoURL?: string | null;
  createdAt: string;
}

export interface FirestoreRole { 
  uid: string;
  role: Role;
  updatedAt: string;
}

// Added for Admin Panel User Management
export type UserStatus = 'Active' | 'Suspended';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  verified?: boolean; // Typically for candidates
}

// Added for Admin Panel Content Moderation
export type ReportedContentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ReportedContentItem {
  id: string;
  contentType: 'Post' | 'Comment' | 'Profile'; // Example content types
  reportedBy: string; // User ID or name
  reason: string;
  contentSnippet: string; // A short preview of the content
  timestamp: string; // ISO string
  status: ReportedContentStatus;
  targetContentId: string; // ID of the reported post, comment, etc.
  targetUserId?: string; // ID of the user who created the content
}

// Added for Volunteer Dashboard
export interface VolunteerTask {
  id: string;
  title: string;
  assignedBy: string; // Candidate Name
  status: 'To Do' | 'In Progress' | 'Completed';
}

export interface VolunteerPost {
  id: string;
  contentSnippet: string;
  createdAt: string;
}

export interface AssignedTask {
    _id: string;
    title: string;
    volunteerName: string;
    volunteerId: string;
    status: 'To Do' | 'In Progress' | 'Completed';
    assignedAt: string;
}

export interface VolunteerCampaign {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}
