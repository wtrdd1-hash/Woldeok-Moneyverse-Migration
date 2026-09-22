import { z } from 'zod';

export const EmergencyTakedownSubmitSchema = z.object({
  requesterEmail: z.string().email(),
  requesterType: z.enum(['victim_self', 'legal_guardian', 'authorized_rep', 'third_party']),
  reasonCategory: z.enum([
    'non_consensual_private_image',
    'underage_harmful_content',
    'doxxing_credible_threat',
    'impersonation_account_takeover',
    'harassment_stalking',
    'illegal_content',
  ]),
  targetContentUrl: z.string().url().max(1024),
  targetContentType: z.enum([
    'board_post',
    'board_comment',
    'gallery_photo',
    'chat_message',
    'profile_bio',
    'other',
  ]),
  description: z.string().min(10).max(4000),
  passcode: z.string().min(6).max(64),
});

export type EmergencyTakedownSubmitDto = z.infer<typeof EmergencyTakedownSubmitSchema>;

export const EmergencyTakedownStatusQuerySchema = z.object({
  caseId: z.string().min(5).max(32),
  passcode: z.string().min(6).max(64),
});

export type EmergencyTakedownStatusQueryDto = z.infer<typeof EmergencyTakedownStatusQuerySchema>;

export const AdminTakedownActionSchema = z.object({
  newStatus: z.enum(['TRIAGED', 'ACTIONED_REMOVED', 'ACTIONED_RESTRICTED', 'REJECTED', 'APPEALED']),
  adminNotes: z.string().max(2000).optional(),
});

export type AdminTakedownActionDto = z.infer<typeof AdminTakedownActionSchema>;
