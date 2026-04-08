import PollPage from "@/components/pages/PostPage";
import { use } from "react";

export default function FullPollPage({ params }: { params: Promise<{ pollId: string }> }) {
    const resolvedParams = use(params);
    return (
        <div>
            <PollPage postId={resolvedParams.pollId} />
        </div>
    )
}