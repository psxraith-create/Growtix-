import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_status, grace_period_ends_at')
    .eq('id', session.user.id)
    .single();

  const isPastDue = profile?.plan_status === 'past_due';
  const hasGracePeriod = profile?.grace_period_ends_at ? new Date(profile.grace_period_ends_at) > new Date() : false;

  if (profile?.plan_status !== 'active' && !(isPastDue && hasGracePeriod)) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/pricing';
    redirectUrl.searchParams.set('reason', isPastDue ? 'payment_failed' : 'subscription_required');
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard', '/upload', '/products', '/suppliers', '/settings'],
};
