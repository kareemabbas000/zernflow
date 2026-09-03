import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

export const locales = ['en', 'ar'];

export default getRequestConfig(async ({requestLocale, locale}) => {
  // Support both next-intl versions for locale
  let resolvedLocale = locale || (requestLocale ? await requestLocale : undefined) || 'en';
  
  if (!locales.includes(resolvedLocale)) {
    resolvedLocale = 'en';
  }

  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default
  };
});
