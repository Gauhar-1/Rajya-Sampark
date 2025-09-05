import Post from "../models/Post.js";

 export const createPost = async(req, res)=>{
    const { content, itemType, mediaUrl } = req.body;
    const profile = req.user;

    try{
        const post = await Post.create({
        profileId : profile._id,
        content,
        mediaUrl,
        timestamp: new Date(Date.now()),
        likes: 0,
        comments: 0,
        shares: 0,
    })

    const detailPost = { 
        ...post._doc,
        itemType,
        creatorName: profile.name,
        creatorImageUrl: profile.photoURL,

    }

    res.status(200).json({ success: true, detailPost })
}
catch(err){
   console.log("Error found by creating Post: ", err);
}
    
 }