import axios from "axios";
import { useToast } from "./use-toast";
import { useState } from "react";


export const useCloud = ()=>{
    const {toast} = useToast();
    const [ dataUrl,  setDataUrl ] = useState<string | null>(null);

    const uploadFile = async(file : File)=>{
      if (!file) {
      return;
    }
      if (file.size > 2 * 1024 * 1024) { 
        toast({ title: 'File too large', description: 'Please upload an image smaller than 2MB.', variant: 'destructive' });
        return;
      }

      try{
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'designsByAfreen');

        const res = await axios.post('https://api.cloudinary.com/v1_1/dccklqtaw/image/upload', formData);

        const { data } = res;

        if(data.secure_url){
            setDataUrl(data.secure_url);
            console.log('Image uploaded successfully:', data.secure_url);
        } else {
      throw new Error('Image upload failed');
    }
      } catch (err) {
    console.error(err);
    toast({ title: 'Upload failed', description: 'Something went wrong during image upload.', variant: 'destructive' });
  }
    }

    return {
        dataUrl,
        uploadFile
    }
}