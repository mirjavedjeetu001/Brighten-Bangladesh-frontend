import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

// Lightweight SEO helper for SPA pages (sets title, meta description, OpenGraph, Twitter, canonical).
export const SEO = ({ title, description, image, url, type = 'website' }: SEOProps) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const siteName = 'Brighten Bangladesh';
    const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
    const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const desc = description?.slice(0, 300) || 'Brighten Bangladesh connects communities through education, collaboration, and positive change across the nation.';

    document.title = fullTitle;

    const setMeta = (attr: 'name' | 'property', name: string, content?: string) => {
      if (!content) return;
      let tag = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', siteName);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', canonicalUrl);

    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', image);

    if (canonicalUrl) {
      let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }
  }, [title, description, image, url, type]);

  return null;
};
