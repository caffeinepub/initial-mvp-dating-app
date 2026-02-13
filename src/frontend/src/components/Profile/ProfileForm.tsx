import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useSaveCallerUserProfile } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PhotoPicker from './PhotoPicker';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { DatingProfile } from '@/backend';
import { Gender } from '@/backend';
import { Principal } from '@icp-sdk/core/principal';

interface ProfileFormProps {
  existingProfile?: DatingProfile;
  isOnboarding: boolean;
  onSuccess?: () => void;
}

interface FormData {
  displayName: string;
  age: string;
  bio: string;
  gender: Gender;
  interestedIn: Gender;
  locationText: string;
  photos: string[];
}

export default function ProfileForm({ existingProfile, isOnboarding, onSuccess }: ProfileFormProps) {
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>(existingProfile?.photos || []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      displayName: existingProfile?.displayName || '',
      age: existingProfile?.age ? String(existingProfile.age) : '',
      bio: existingProfile?.bio || '',
      gender: existingProfile?.gender || Gender.other,
      interestedIn: existingProfile?.interestedIn || Gender.other,
      locationText: existingProfile?.locationText || '',
      photos: existingProfile?.photos || []
    }
  });

  const gender = watch('gender');
  const interestedIn = watch('interestedIn');

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const age = parseInt(data.age);
    
    if (isNaN(age) || age < 18 || age > 120) {
      toast.error('Please enter a valid age between 18 and 120');
      return;
    }

    if (!data.displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (selectedPhotos.length === 0) {
      toast.error('Please select at least one photo');
      return;
    }

    const profile: DatingProfile = {
      id: Principal.anonymous(),
      displayName: data.displayName.trim(),
      age: BigInt(age),
      bio: data.bio.trim(),
      gender: data.gender,
      interestedIn: data.interestedIn,
      locationText: data.locationText.trim(),
      photos: selectedPhotos
    };

    saveProfile(profile, {
      onSuccess: () => {
        toast.success(isOnboarding ? 'Profile created successfully!' : 'Profile updated successfully!');
        onSuccess?.();
      },
      onError: (error) => {
        toast.error('Failed to save profile. Please try again.');
        console.error('Profile save error:', error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="displayName">Name *</Label>
        <Input
          id="displayName"
          {...register('displayName', { required: true })}
          placeholder="Your name"
        />
        {errors.displayName && <p className="text-sm text-destructive">Name is required</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Age *</Label>
        <Input
          id="age"
          type="number"
          {...register('age', { required: true, min: 18, max: 120 })}
          placeholder="18"
        />
        {errors.age && <p className="text-sm text-destructive">Please enter a valid age (18-120)</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender *</Label>
        <Select value={gender} onValueChange={(value) => setValue('gender', value as Gender)}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Gender.male}>Male</SelectItem>
            <SelectItem value={Gender.female}>Female</SelectItem>
            <SelectItem value={Gender.other}>Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interestedIn">Interested In *</Label>
        <Select value={interestedIn} onValueChange={(value) => setValue('interestedIn', value as Gender)}>
          <SelectTrigger>
            <SelectValue placeholder="Select preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Gender.male}>Male</SelectItem>
            <SelectItem value={Gender.female}>Female</SelectItem>
            <SelectItem value={Gender.other}>Everyone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="locationText">Location</Label>
        <Input
          id="locationText"
          {...register('locationText')}
          placeholder="City, Country"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder="Tell us about yourself..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Photos * (Select up to 5)</Label>
        <PhotoPicker
          selectedPhotos={selectedPhotos}
          onPhotosChange={setSelectedPhotos}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isOnboarding ? 'Create Profile' : 'Save Changes'}
      </Button>
    </form>
  );
}
