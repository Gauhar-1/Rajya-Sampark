import Issue from '@/lib/models/Issue';
import Post from '@/lib/models/Post';
import Candidate from '@/lib/models/Candidate';
import { AppError } from '@/lib/api-utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

const takePostAsIssue = async (profile: any, postId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(404, "Couldn't find the post");
  }

  const issue = new Issue({
    postId,
    takenBy: profile._id,
  });

  await issue.save();
  return issue;
};

const getIssuePost = async (profile: any) => {
  const issuePosts = await Issue.find({ takenBy: profile._id }).populate('postId');
  return issuePosts || [];
};

const deleteIssuePost = async (id: string) => {
  await Issue.findByIdAndDelete(id);
};

const takePermissionForIssuePost = async (id: string) => {
  const issue = await Issue.findById(id);
  if (!issue) {
    throw new AppError(404, 'Could not find the Post');
  }

  issue.status = 'pending';
  await issue.save();
  return issue;
};

const getIssuesForCandidate = async (profile: any) => {
  const candidate = await Candidate.findOne({ uid: profile.uid });
  if (!candidate) {
    throw new AppError(404, "Couldn't find the candidate");
  }

  const issues = await Issue.find({}).populate('takenBy', 'phone').sort({ createdAt: -1 });

  const candidateIssues = issues.filter((i: any) => i.takenBy && i.takenBy.candidateId != candidate._id);
  return candidateIssues;
};

const givePermissionForIssuePost = async (id: string, status: string) => {
  const issue = await Issue.findById(id);
  if (!issue) {
    throw new AppError(404, "Couldn't find the id");
  }

  issue.status = status;
  await issue.save();
  return issue;
};

const issueService = {
  takePostAsIssue,
  getIssuePost,
  deleteIssuePost,
  takePermissionForIssuePost,
  getIssuesForCandidate,
  givePermissionForIssuePost,
};

export default issueService;
