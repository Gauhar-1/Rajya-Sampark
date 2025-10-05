import axios from "axios";
import { useToast } from "./use-toast";
import { useState } from "react";

interface UseCloundinaryUpload {
  isLoading: boolean;
  progress: number;
  error: string | null;
  uploadFile: (file: File) => Promise<string | null>;
}

export const useCloud = () : UseCloundinaryUpload=>{
    const {toast} = useToast();
    const [ isLoading, setIsLoading ] = useState<boolean>(false);
    const [ progress, setProgress ] = useState<number>(0);
    const [ error, setError ] = useState<string | null>(null);

    const uploadFile = async(file : File) : Promise<string | null>=>{
      setIsLoading(true);
      setError(null);
      setProgress(0);

      try{

        const { signature, timestamp, api_key, cloud_name } = await axios.post(`/api/sign-cloudinary-upload`).then(res => res.data);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('api_key', api_key);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`

        const res = await axios.post(uploadUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress : (ProgressEvent) =>{
            if(ProgressEvent.total){
              setProgress(Math.round((ProgressEvent.loaded * 100)/ ProgressEvent.total));
            }
          }
        });

        return res.data.secure_url;
      } catch (err) {
    console.error("Error Found while uploading the file",err);
    toast({ title: 'Upload failed', description: 'Something went wrong during image upload.', variant: 'destructive' });
    return null;
  }
  finally{
    setIsLoading(false);
  }
    }

    return {
      isLoading,
      progress,
      error,
      uploadFile
    }
}