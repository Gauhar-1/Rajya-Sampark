import Poll from "../models/Poll.js";
import Post from "../models/Post.js";

 export const createPost = async(req, res)=>{
    const { content, itemType, mediaUrl } = req.body;
    const profile = req.user;

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
    })

    const detailPost = { 
        ...post._doc,
        creatorName: profile.name,
        creatorImageUrl: profile.photoURL,
    }

    res.status(200).json({ success: true, detailPost })
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

    const detailPoll = { 
        ...poll._doc,
        creatorName: profile.name,
        creatorImageUrl: profile.photoURL,
    }

    res.status(200).json({ success: true, detailPoll })
}
catch(err){
   console.log("Error found by creating Post: ", err);
}
    
 }