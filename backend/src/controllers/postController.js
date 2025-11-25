import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/apiResponse.js';
import postService from '../services/postService.js';
import issueService from '../services/issueService.js';

export const createPost = catchAsync(async (req, res) => {
    const { content, itemType, mediaUrl } = req.body;
    const profile = req.user;
    const post = await postService.createPost(profile, content, itemType, mediaUrl);
    sendResponse(res, httpStatus.OK, true, 'Post created successfully', { populatedPost: post });
});

export const createPoll = catchAsync(async (req, res) => {
    const { pollQuestion, pollOptions } = req.body;
    const profile = req.user;
    const poll = await postService.createPoll(profile, pollQuestion, pollOptions);
    sendResponse(res, httpStatus.OK, true, 'Poll created successfully', { populatedPoll: poll });
});

export const getFeed = catchAsync(async (req, res) => {
    const allFeed = await postService.getFeed();
    sendResponse(res, httpStatus.OK, true, 'Feed fetched successfully', { allFeed });
});

export const getFeedById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await postService.getFeedById(id);
    sendResponse(res, httpStatus.OK, true, 'Post fetched successfully', { post });
});

export const votePoll = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { optionId } = req.body;
    const profile = req.user;
    const poll = await postService.votePoll(profile, id, optionId);
    sendResponse(res, httpStatus.OK, true, 'Voted successfully', { poll });
});

export const postComment = catchAsync(async (req, res) => {
    const { content, timestamp, postId } = req.body;
    const profile = req.user;
    const comment = await postService.postComment(profile, postId, content, timestamp);
    sendResponse(res, httpStatus.OK, true, 'Comment posted successfully', { populatedComment: comment });
});

export const getComments = catchAsync(async (req, res) => {
    const { id } = req.params;
    const comments = await postService.getComments(id);
    sendResponse(res, httpStatus.OK, true, 'Comments fetched successfully', { comments });
});

export const updateLikes = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;
    const profile = req.user;
    const likeCount = await postService.updateLikes(profile, id, action);
    sendResponse(res, httpStatus.OK, true, 'Likes updated successfully', { likeCount });
});

export const deletePost = catchAsync(async (req, res) => {
    const { id } = req.params;
    const profile = req.user;
    await postService.deletePost(profile, id);
    sendResponse(res, httpStatus.OK, true, 'Post deleted successfully');
});

// Issue Controller Functions

export const takePostAsIssue = catchAsync(async (req, res) => {
    const { id } = req.body;
    const profile = req.user;
    await issueService.takePostAsIssue(profile, id);
    sendResponse(res, httpStatus.OK, true, 'Successful');
});

export const getIssuePost = catchAsync(async (req, res) => {
    const profile = req.user;
    const posts = await issueService.getIssuePost(profile);
    if (posts.length === 0) {
        return sendResponse(res, httpStatus.OK, true, "No issues assigned to this user.", { posts: [] });
    }
    sendResponse(res, httpStatus.OK, true, 'Issue posts fetched successfully', { posts });
});

export const deleteIssuePost = catchAsync(async (req, res) => {
    const { id } = req.params;
    await issueService.deleteIssuePost(id);
    sendResponse(res, httpStatus.OK, true, 'Issue post deleted successfully');
});

export const takePermissionForIssuePost = catchAsync(async (req, res) => {
    const { id } = req.params;
    await issueService.takePermissionForIssuePost(id);
    sendResponse(res, httpStatus.OK, true, "Successfully sent the Req");
});

export const getIssuesForCandidate = catchAsync(async (req, res) => {
    const profile = req.user;
    const issues = await issueService.getIssuesForCandidate(profile);
    sendResponse(res, httpStatus.OK, true, 'Candidate issues fetched successfully', { issues });
});

export const givePermissionForIssuePost = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    await issueService.givePermissionForIssuePost(id, status);
    sendResponse(res, httpStatus.OK, true, `Successfully changed the status to ${status}`);
});