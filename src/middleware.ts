import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(en|ko|ja|zh-Hans|zh-Hant|es|pt|fr|de|ar)/:path*'],
};
