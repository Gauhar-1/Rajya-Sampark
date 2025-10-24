'use client'

import PostPage from "@/components/pages/PostPage";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";


export default function PostModal({ params }: { params: Promise<{ postId: string }>}){
    const router = useRouter();

    const resolvedParams = use(params);
    const postId = resolvedParams.postId;

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
            <DialogTitle>{''}</DialogTitle>
        <DialogContent className='border-none  my-4 max-w-5xl p-0'>
        <PostPage postId={postId}></PostPage>
        </DialogContent>
      </Dialog>
    )
}