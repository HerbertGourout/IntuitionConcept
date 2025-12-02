import { useEffect } from 'react';

interface PageMetaProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

/**
 * Composant pour gérer les meta tags SEO de chaque page
 * Usage: <PageMeta title="Ma Page" description="Description de la page" />
 */
const PageMeta: React.FC<PageMetaProps> = ({
  title,
  description,
  keywords,
  ogImage = 'https://intuitionconcept.com/og-image.jpg',
  canonical,
}) => {
  useEffect(() => {
    // Titre de la page
    document.title = `${title} | IntuitionConcept`;

    // Meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      }
    }

    // Open Graph
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) {
      ogTitleMeta.setAttribute('content', title);
    }

    const ogDescMeta = document.querySelector('meta[property="og:description"]');
    if (ogDescMeta) {
      ogDescMeta.setAttribute('content', description);
    }

    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (ogImageMeta) {
      ogImageMeta.setAttribute('content', ogImage);
    }

    // Twitter
    const twitterTitleMeta = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleMeta) {
      twitterTitleMeta.setAttribute('content', title);
    }

    const twitterDescMeta = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescMeta) {
      twitterDescMeta.setAttribute('content', description);
    }

    // Canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }

    // Cleanup
    return () => {
      // Reset to default on unmount if needed
    };
  }, [title, description, keywords, ogImage, canonical]);

  return null; // Ce composant ne rend rien visuellement
};

export default PageMeta;
