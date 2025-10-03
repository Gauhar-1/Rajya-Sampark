import Group from "../models/Group.js";
import Volunteer from "../models/Volunteer.js";

 export const createGroup = async(req, res)=>{
    const { name, description, volunterIds } = req.body;
    const profile = req.user;

    if(!name || !description){
        return res.status(400).json({ message : "Missing fields"});
    }

    if(!volunterIds || volunterIds.length == 0){
        return res.status(400).json({ message : "At least one volunteer must be added"});
    }

    try{
        const volunteers = await Volunteer.find({ _id : { $in : volunterIds } });

    if(volunteers.length != volunterIds.length){
        return res.status(404).json({ message: "One or more user IDs are invalid"});
    }

    const members = volunterIds.map(id =>({
        userId: id,
    }));

    members.push({
        userId : profile.uid,
        roleInGroup : 'admin'
    })

    const newGroup = new Group({
        name,
        description,
        createdBy: profile._id,
        members
    })

    await newGroup.save();

    res.status(200).json({ success: true, newGroup});
}
catch(err){
    console.log("Error found ", err.message);
}
 }

 export const getGroups = async(req, res)=>{
    const profile = req.user;
    try{
        const groups = await Group.find({ createdBy : profile._id });

        if(!groups) return res.status(400).json({ message : "Didn't find groups "});

        res.status(200).json({ success: true, groups });
    }
    catch(err){
        console.log("Found error while fetching group chat", err);
    }
 }

 export const getGroupsForVolunter = async(req, res)=>{
    const profile = req.user;

    try{
        const volunteer = await Volunteer.findOne({ phone: profile.phone});

        if(!volunteer) return res.status(400).json({ message: "Volunter not found"});

        const groups = await Group.find({ 'members.userId': volunteer._id }).populate('createdBy');

        if(groups.length == 0) return res.status(400).json({ message: "No group found"});

        res.status(200).json({ success: true, groups});
    }
    catch(err){
        console.log("Error found while fetching volunteer groups",err);
    }
 }