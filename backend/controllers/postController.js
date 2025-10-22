import Comment from "../models/Comment.js";
import Issue from "../models/Issue.js";
import Poll from "../models/Poll.js";
import Post from "../models/Post.js";
import Volunteer from "../models/Volunteer.js";

 export const createPost = async(req, res)=>{
    const { content, itemType, mediaUrl } = req.body;
    const profile = req.user;

    if((itemType == "image_post" || itemType == "video_post") && mediaUrl == '') return res.status(404).json({ message: "Media Url not found"});

    const isIssueMentionend = content.split(" ").find( c => c == "#issue");


    try{
        const post = await Post.create({
        profileId : profile._id,
        content,
        mediaUrl,
        itemType,
        timestamp: new Date(Date.now()),
        likes: 0,
        comments: 0,
        shares: 0,
        isIssue: !!isIssueMentionend,
    })

    const populatedPost = await post.populate('profileId')

    res.status(200).json({ success: true, populatedPost })
}
catch(err){
   console.log("Error found by creating Post: ", err);
}

    
 }
 export const createPoll = async(req, res)=>{
    const { pollQuestion, pollOptions } = req.body;
    const profile = req.user;

    if(!pollQuestion){
        return console.log("No pollQuestions", pollQuestion)
    }
    if(pollQuestion.length == 0){
        return console.log("No pollOptions", pollOptions)
    }

    try{
        const poll = await Poll.create({
        profileId : profile._id,
        pollQuestion,
        pollOptions,
        itemType: 'poll_created',
        timestamp: new Date(Date.now()),
        totalVotes: 0,
    })

    const populatedPoll = await poll.populate('profileId');

    res.status(200).json({ success: true, populatedPoll })
}
catch(err){
   console.log("Error found by creating Post: ", err);
}
    
 }

 export const getFeed = async(req, res)=>{

    try{ 
        const post = await Post.find().populate('profileId');

        const poll = await Poll.find().populate('profileId');

        const allFeed = [ ...post, ...poll];

        res.status(200).json({ success: true, allFeed });
    }
    catch(err){
        console.log("Error found while getting Feed", err);
    }
 }

 export const votePoll = async(req, res)=>{
    try{
        const { id } = req.params;
        const { optionId }= req.body;
        const profile = req.user;

        const poll = await Poll.findById(id);

        if(!poll){
            res.status(404).json({ message : "No poll found" });
        }

        const isVoted = poll.userHasVoted.find( vote => vote.profileId == profile._id);

        if(isVoted){
           return  res.status(403).json({ message : "User already voted" });
        }

        const newOptions = poll.pollOptions.map( option => optionId == option.id ? { ...option , votes : option.votes + 1} : option);
        poll.pollOptions = newOptions;
        poll.userHasVoted.push({ profileId : profile._id , voted : true });
        poll.totalVotes +=1;
        await poll.save();

        res.status(200).json({ success: true, poll })
    }
    catch(err){
        console.log("Error found while voting the poll" , err);
        res.status(400).json( { error: err.message });
    }
 }

 export const postComment = async(req, res)=>{
    const { content, timestamp, postId } = req.body;
    const profile = req.user;

    if(!postId) return res.status(404).json({ message : "Post Id missing" });

    if(!content || !timestamp) return res.status(404).json({ message: "Field missing"});

    try{
        const post = await Post.findById(postId);

        if(!post) return res.status(404).json({ message : "Couldn't find the post" });

        const newComment = new Comment({
            postId,
            profileId : profile._id,
            content,
            timestamp 
        });

        await newComment.save();

        post.comments +=1;
        await post.save();

        const populatedComment = await newComment.populate('profileId');

        res.status(200).json({ success: true, populatedComment });
    }
    catch(error){
        console.error("Error found while posting comment", error);
        res.status(500).json({ error });
    }
 }

 export const getComments = async(req, res)=>{
    const { id } = req.params;

    if(!id) return res.status(404).json({ message : "Post Id missing "});

    try{
        const comments = await Comment.find({ postId : id}).populate('profileId');

        if(comments.length == 0) return res.status(200).json({ success: false });

        res.status(200).json({ success:true, comments});
    }
    catch(err){
        console.error("Error found while getting comments", err);
        res.status(500).json({ error : err });
    }
 }

 export const updateLikes = async(req, res)=>{
    const { id } = req.params;
    const { action } = req.body;
    const profile = req.user;

    if(!id) return res.status(400).json({ message : "Post Id missing"});

    if(!action) return res.status(400).json({ message : "Missing fields"});

    try{
        const post = await Post.findById(id);

        if(!post) return res.status(404).json({ message : "Could not find the post" });

        const isLiked = post.likedBy.find( id => id == profile._id);

        if(isLiked && action == "like") return res.status(400).json({ message : "Already liked the post "});

        if(action == "like"){
             post.likedBy.push(profile._id);
             post.likes +=1;
        }
        else{
            const filtered = post.likedBy.filter(id => id != profile._id);
            post.likedBy = filtered;
            post.likes = Math.max(0, post.likes -1);
        }

        await post.save();

        res.status(200).json({ success: true, likeCount : post.likes });
    }
    catch(err){
        console.error("Error found while updating likes", err);
        res.status(500).json({ error : err});
    }
 }

 export const deletePost = async(req, res)=>{
    const { id } = req.params;
    const profile = req.user;

    if(!id) return res.status(400).json({ message: "Post id missing"});

    try{
        const post = await Post.findById(id);

        if(!post) return res.status(404).json({ message: "Couldn't find the post"});

        if(post.profileId != profile._id) return res.status(401).json({ message : "Unauthorized access"});

        if(post.comments > 0){
            await Comment.deleteMany({ postId : id});
        }

        await Post.findByIdAndDelete(id);

        res.status(200).json({ success: true});
    }
    catch(err){
        console.log("Error found while deleting the post", err);
        res.status(500).json({ message : err});
    }
 }

 export const takePostAsIssue = async(req, res)=>{
     const { id } = req.body;
     const profile = req.user;

     try{
        const post = await Post.findById(id);

        if(!post) return res.status(404).json({ message: "Couldn't find the post"});

        const issue = new Issue({
            postId: id,
            takenBy: profile._id,
        });

        await issue.save();

        res.status(200).json({ message: "Successfull", success: true});
     }

     catch(err){
        console.log("Error found while taking the issue of post", err);
        res.status(400).json({ message: err});
     }
 }