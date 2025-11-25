import Post from "../models/Post.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comment.js";
import AppError from "../utils/AppError.js";
import httpStatus from "http-status";

const createPost = async (profile, content, itemType, mediaUrl) => {
    if ((itemType === "image_post" || itemType === "video_post") && !mediaUrl) {
        throw new AppError(httpStatus.BAD_REQUEST, "Media Url not found");
    }

    const isIssueMentionend = content.split(" ").find(c => c === "#issue");

    const post = await Post.create({
        profileId: profile._id,
        content,
        mediaUrl,
        itemType,
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        shares: 0,
        isIssue: !!isIssueMentionend,
    });

    return await post.populate('profileId');
};

const createPoll = async (profile, pollQuestion, pollOptions) => {
    if (!pollQuestion || pollQuestion.length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Poll question is required");
    }
    if (!pollOptions || pollOptions.length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Poll options are required");
    }

    const poll = await Poll.create({
        profileId: profile._id,
        pollQuestion,
        pollOptions,
        itemType: 'poll_created',
        timestamp: new Date(),
        totalVotes: 0,
    });

    return await poll.populate('profileId');
};

const getFeed = async () => {
    const posts = await Post.find().populate('profileId');
    const polls = await Poll.find().populate('profileId');
    return [...posts, ...polls]; // You might want to sort this by timestamp
};

const getFeedById = async (id) => {
    const post = await Post.findById(id).populate('profileId');
    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, "Couldn't find the post");
    }
    return post;
};

const votePoll = async (profile, id, optionId) => {
    const poll = await Poll.findById(id);
    if (!poll) {
        throw new AppError(httpStatus.NOT_FOUND, "No poll found");
    }

    const isVoted = poll.userHasVoted.find(vote => vote.profileId.toString() === profile._id.toString());
    if (isVoted) {
        throw new AppError(httpStatus.FORBIDDEN, "User already voted");
    }

    const newOptions = poll.pollOptions.map(option =>
        optionId == option.id ? { ...option, votes: option.votes + 1 } : option
    );
    poll.pollOptions = newOptions;
    poll.userHasVoted.push({ profileId: profile._id, voted: true });
    poll.totalVotes += 1;
    await poll.save();

    return poll;
};

const postComment = async (profile, postId, content, timestamp) => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, "Couldn't find the post");
    }

    const newComment = new Comment({
        postId,
        profileId: profile._id,
        content,
        timestamp
    });

    await newComment.save();

    post.comments += 1;
    await post.save();

    return await newComment.populate('profileId');
};

const getComments = async (postId) => {
    const comments = await Comment.find({ postId }).populate('profileId');
    return comments;
};

const updateLikes = async (profile, id, action) => {
    const post = await Post.findById(id);
    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, "Could not find the post");
    }

    const isLiked = post.likedBy.find(uid => uid.toString() === profile._id.toString());

    if (isLiked && action === "like") {
        throw new AppError(httpStatus.BAD_REQUEST, "Already liked the post");
    }

    if (action === "like") {
        post.likedBy.push(profile._id);
        post.likes += 1;
    } else {
        post.likedBy = post.likedBy.filter(uid => uid.toString() !== profile._id.toString());
        post.likes = Math.max(0, post.likes - 1);
    }

    await post.save();
    return post.likes;
};

const deletePost = async (profile, id) => {
    const post = await Post.findById(id);
    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, "Couldn't find the post");
    }

    if (post.profileId.toString() !== profile._id.toString()) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }

    if (post.comments > 0) {
        await Comment.deleteMany({ postId: id });
    }

    await Post.findByIdAndDelete(id);
};

export default {
    createPost,
    createPoll,
    getFeed,
    getFeedById,
    votePoll,
    postComment,
    getComments,
    updateLikes,
    deletePost
};
