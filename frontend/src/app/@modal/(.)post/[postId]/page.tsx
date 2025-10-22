'use client'

import PostPage from "@/components/pages/PostPage";
import { DialogContent } from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function PostModal({ params }: { params: {postId: string }}){
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    const onDismiss = ()=>{
        router.back();
    }

    if(!isMounted){
        return null;
    }

    return (
        <Dialog open={true} onOpenChange={onDismiss}>
        <DialogContent className='border-none  my-4 max-w-5xl p-0'>
        <PostPage postId={params.postId}></PostPage>
        </DialogContent>
      </Dialog>
    )
}