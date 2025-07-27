import { HandHeart } from 'lucide-react';
import { VolunteerSignupForm } from './VolunteerSignupForm';

export default function VolunteerSignupPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <HandHeart className="mr-3 h-7 w-7 text-primary" />
        Volunteer Signup
      </h1>
      <p className="text-muted-foreground mb-6">
        Ready to make a difference? Fill out the form below to get involved with campaigns and contribute to your community.
      </p>
      <VolunteerSignupForm />
    </div>
  );
}
