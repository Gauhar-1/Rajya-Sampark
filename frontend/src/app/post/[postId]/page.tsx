import PostPage from "@/components/pages/PostPage";

export default function FullPostPage({params}: { params: { postId: string} }) {

    return (
        <div>
            <PostPage postId = {params.postId} />
        </div>
    )
}