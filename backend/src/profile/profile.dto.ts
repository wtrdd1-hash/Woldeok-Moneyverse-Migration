import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import type { ProfileVisibility } from './profile.repository';
import { PROFILE_VISIBILITIES } from './profile.repository';

/**
 * A replacement of the caller's profile, not a patch. Every optional field
 * that is absent is stored as NULL, because that is what
 * `public.member_update_profile` does with the argument -- see
 * `ProfileRepository.update`.
 *
 * The bounds here only keep an oversized body out of the repository. The
 * exact ones are 079's CHECK constraints, mirrored in `profile.repository.ts`
 * so that one file answers for what a field may hold.
 */
export class ProfileUpdateDto {
  @ApiProperty({ enum: [...PROFILE_VISIBILITIES] })
  @IsIn([...PROFILE_VISIBILITIES])
  readonly visibility!: ProfileVisibility;

  /** Absent or blank falls back to the name the OAuth identity carries. */
  @ApiProperty({ required: false, maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  readonly displayName?: string;

  @ApiProperty({ required: false, maxLength: 2048 })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  readonly imageUrl?: string;

  /**
   * Field name to visibility, for the fields `member_profile_view` consults:
   * profile, imageUrl, jobType, workCompletions, featuredTitle. A field left
   * out of the map is shown on the profile's own visibility.
   */
  @ApiProperty({
    required: false,
    type: Object,
    example: { imageUrl: 'private', workCompletions: 'members' },
  })
  @IsOptional()
  @IsObject()
  readonly fieldVisibility?: Record<string, string>;

  /** A title code the member has been awarded, or absent for none. */
  @ApiProperty({ required: false, maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  readonly featuredTitle?: string;
}
