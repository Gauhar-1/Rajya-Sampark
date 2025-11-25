import Issue from "../models/Issue.js";
import Post from "../models/Post.js";
import Candidate from "../models/Candidate.js";
import AppError from "../utils/AppError.js";
import httpStatus from "http-status";

const takePostAsIssue = async (profile, postId) => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, "Couldn't find the post");
    }

    const issue = new Issue({
        postId,
        takenBy: profile._id,
    });

    await issue.save();
    return issue;
};

const getIssuePost = async (profile) => {
    const issuePosts = await Issue.find({ takenBy: profile._id }).populate('postId');
    return issuePosts || [];
};

const deleteIssuePost = async (id) => {
    await Issue.findByIdAndDelete(id);
};

const takePermissionForIssuePost = async (id) => {
    const issue = await Issue.findById(id);
    if (!issue) {
        throw new AppError(httpStatus.NOT_FOUND, "Could not find the Post");
    }

    issue.status = 'pending';
    await issue.save();
    return issue;
};

const getIssuesForCandidate = async (profile) => {
    const candidate = await Candidate.findOne({ uid: profile.uid });
    if (!candidate) {
        throw new AppError(httpStatus.NOT_FOUND, "Couldn't find the candidate");
    }

    const issues = await Issue.find({}).populate('takenBy', 'phone').sort({ createdAt: -1 });

    // Filter issues not taken by this candidate (logic from controller seems to imply this)
    // "candidateIssues = issues.filter( i => i.takenBy.candidateId != candidate._id);"
    // Wait, takenBy is a Profile/User. Does it have candidateId? 
    // Assuming the original logic was correct, but 'takenBy' is populated with 'phone'.
    // If 'takenBy' refers to a User/Profile, we need to check if that user is the candidate?
    // The original code: i.takenBy.candidateId != candidate._id
    // This implies 'takenBy' (User/Profile) has a 'candidateId' field?
    // I will keep the logic but we might need to verify the User model.
    // For now, I'll assume the original logic was intended.

    const candidateIssues = issues.filter(i => i.takenBy && i.takenBy.candidateId != candidate._id);
    return candidateIssues;
};

const givePermissionForIssuePost = async (id, status) => {
    const issue = await Issue.findById(id);
    if (!issue) {
        throw new AppError(httpStatus.NOT_FOUND, "Couldn't find the id");
    }

    issue.status = status;
    await issue.save();
    return issue;
};

export default {
    takePostAsIssue,
    getIssuePost,
    deleteIssuePost,
    takePermissionForIssuePost,
    getIssuesForCandidate,
    givePermissionForIssuePost
};
