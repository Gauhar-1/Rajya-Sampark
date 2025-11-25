import PostPage from "@/components/pages/PostPage";
import { use } from "react";

export default function FullPostPage({ params }: { params: Promise<{ postId: string }> }) {
    const resolvedParams = use(params);
    return (
        <div>
            <PostPage postId={resolvedParams.postId} />
        </div>
    )
}