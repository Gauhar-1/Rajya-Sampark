import Timeline from "../models/Timeline.js";

export const getTimelines = async(req, res)=>{
  const timelines = await Timeline.find();
  res.status(200).json({ success: true, timelines });
}

export const createTimeline = async(req, res)=>{

  const { title, description , type, date } = req.body;

  const timeline = new Timeline({
    title,
    description,
    type,
    date,
  });

  await timeline.save();

  res.status(200).json({ success: true, timeline });

}

export const updateTimeline = async( req, res)=>{
   const { title, description , type, date } = req.body;
   const { id } = req.params;

   if(!id){
    res.status(404).json({ message: "Timeline Id not found"});
   }

   const timeline = await Timeline.findByIdAndUpdate(id,{
    title,
    description,
    type,
    date
   },{ new: true });

   res.status(200).json({ success: true, timeline});

}


export const deleteTimeline = async( req, res )=>{
  const { id }= req.params;

  if(!id){
    res.status(404).json({ message: "Timeline Id not found"});
   }

   const timeline = await Timeline.findByIdAndDelete(id);

   res.status(200).json({ success: true});

}