import { forwardAdministratorPost } from '@/lib/admin-channel-otp-proxy';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return forwardAdministratorPost(request, '/api/v1/admin/auth/channel-otp/request');
}
