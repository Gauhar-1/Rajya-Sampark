import Post from '@/lib/models/Post';
import Poll from '@/lib/models/Poll';
import Comment from '@/lib/models/Comment';
import Profile from '@/lib/models/Profile';
import { AppError } from '@/lib/api-utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

const createPost = async (title: string, profile: any, content: string, itemType: string, mediaUrl: string) => {
  if (!title || title.length === 0) {
    throw new AppError(400, 'Post title is required');
  }
  if ((itemType === 'image_post' || itemType === 'video_post') && !mediaUrl) {
    throw new AppError(400, 'Media Url not found');
  }

  const isIssueMentioned = content.split(' ').find((c: string) => c === '#issue');

  const post = await Post.create({
    profileId: profile._id,
    title,
    content,
    mediaUrl,
    itemType,
    timestamp: new Date(),
    likes: 0,
    comments: 0,
    shares: 0,
    isIssue: !!isIssueMentioned,
  });

  return await post.populate('profileId');
};

const createPoll = async (title: string, profile: any, pollQuestion: string, pollOptions: any[]) => {
  if (!title || title.length === 0) {
    throw new AppError(400, 'Poll title is required');
  }
  if (!pollQuestion || pollQuestion.length === 0) {
    throw new AppError(400, 'Poll question is required');
  }
  if (!pollOptions || pollOptions.length === 0) {
    throw new AppError(400, 'Poll options are required');
  }

  const poll = await Poll.create({
    profileId: profile._id,
    title,
    pollQuestion,
    pollOptions,
    itemType: 'poll_created',
    timestamp: new Date(),
    totalVotes: 0,
  });

  return await poll.populate('profileId');
};

const getFeed = async (page: number, limit: number) => {
  const posts = await Post.find().populate('profileId');
  const polls = await Poll.find().populate('profileId');

  const allFeed = [...posts, ...polls];
  allFeed.sort((a: any, b: any) => b.timestamp - a.timestamp);

  const paginatedFeed = allFeed.slice((page - 1) * limit, page * limit);

  return paginatedFeed;
};

const getFeedById = async (id: string) => {
  const post = await Post.findById(id).populate('profileId');
  if (!post) {
    const poll = await Poll.findById(id).populate('profileId');
    if (!poll) throw new AppError(404, "Couldn't find the post");
    return poll;
  }
  return post;
};

const votePoll = async (profile: any, id: string, optionId: string) => {
  const poll = await Poll.findById(id);
  if (!poll) {
    throw new AppError(404, 'No poll found');
  }

  const isVoted = poll.userHasVoted.find((vote: any) => vote.profileId?.toString() === profile._id.toString());
  if (isVoted) {
    throw new AppError(403, 'User already voted');
  }

  const newOptions = poll.pollOptions.map((option: any) =>
    optionId == option.id ? { ...option, votes: option.votes + 1 } : option
  );
  poll.pollOptions = newOptions;
  poll.userHasVoted.push({ profileId: profile._id, voted: true });
  poll.totalVotes += 1;
  await poll.save();

  return poll;
};

const postComment = async (profile: any, postId: string, content: string, timestamp: Date) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(404, "Couldn't find the post");
  }

  const newComment = new Comment({
    postId,
    profileId: profile._id,
    content,
    timestamp,
  });

  await newComment.save();

  post.comments += 1;
  await post.save();

  return await newComment.populate('profileId');
};

const getComments = async (postId: string) => {
  const comments = await Comment.find({ postId }).populate('profileId');
  return comments;
};

const updateLikes = async (profile: any, id: string, action: string) => {
  const post = await Post.findById(id);
  if (!post) {
    throw new AppError(404, 'Could not find the post');
  }

  const isLiked = post.likedBy.find((uid: any) => uid.toString() === profile._id.toString());

  if (isLiked && action === 'like') {
    throw new AppError(400, 'Already liked the post');
  }

  if (action === 'like') {
    post.likedBy.push(profile._id);
    post.likes += 1;
  } else {
    post.likedBy = post.likedBy.filter((uid: any) => uid.toString() !== profile._id.toString());
    post.likes = Math.max(0, post.likes - 1);
  }

  await post.save();
  return post.likes;
};

const deletePost = async (profile: any, id: string) => {
  const post = await Post.findById(id);
  if (!post) {
    throw new AppError(404, "Couldn't find the post");
  }

  if (post.profileId.toString() !== profile._id.toString()) {
    throw new AppError(401, 'Unauthorized access');
  }

  if (post.comments > 0) {
    await Comment.deleteMany({ postId: id });
  }

  await Post.findByIdAndDelete(id);
};

const postService = {
  createPost,
  createPoll,
  getFeed,
  getFeedById,
  votePoll,
  postComment,
  getComments,
  updateLikes,
  deletePost,
};

export default postService;
