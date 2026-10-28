import { useFormContext } from 'react-hook-form'
import { TextField } from '@/components/ui/TextField'
import type { CardContent } from '@/types/card'
import { FormSection } from '../FormSection'

export function ProfileSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CardContent>()
  const profileErrors = errors.profile

  return (
    <FormSection title="Profile" description="Who you are and where you work.">
      <TextField
        label="Full name"
        autoComplete="name"
        error={profileErrors?.fullName?.message}
        {...register('profile.fullName')}
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField
          label="Job title"
          placeholder="e.g. Senior Insurance Broker"
          autoComplete="organization-title"
          error={profileErrors?.jobTitle?.message}
          {...register('profile.jobTitle')}
        />
        <TextField
          label="Company"
          autoComplete="organization"
          error={profileErrors?.company?.message}
          {...register('profile.company')}
        />
        <TextField
          label="Department (optional)"
          error={profileErrors?.department?.message}
          {...register('profile.department')}
        />
        <TextField
          label="Licence or credential (optional)"
          placeholder="e.g. RIBO Licensed"
          error={profileErrors?.credential?.message}
          {...register('profile.credential')}
        />
      </div>
    </FormSection>
  )
}
