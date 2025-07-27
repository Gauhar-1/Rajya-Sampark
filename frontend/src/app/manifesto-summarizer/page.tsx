import { FileText } from 'lucide-react';
import { ManifestoSummarizeForm } from './ManifestoSummarizeForm';

export default function ManifestoSummarizerPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FileText className="mr-3 h-7 w-7 text-primary" />
        Manifesto Summarizer
      </h1>
      <p className="text-muted-foreground mb-6">
        Paste a candidate's manifesto below to get an AI-powered summary. This tool helps you quickly understand key points and policies.
      </p>
      <ManifestoSummarizeForm />
    </div>
  );
}
