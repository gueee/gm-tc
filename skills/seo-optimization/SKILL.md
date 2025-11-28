---
name: seo-optimization
description: SEO and meta optimization for gm-tc.tech. Use when adding meta tags, improving search visibility, setting up structured data, optimizing content, or configuring social sharing. Covers technical SEO, Open Graph, and search engine best practices.
---

# SEO Optimization

Search engine optimization for gm-tc.tech.

## Essential Meta Tags

Every page should include:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page Title - gm-tc.tech</title>
  <meta name="description" content="Compelling 150-160 char description">
  <link rel="canonical" href="https://gm-tc.tech/page/">
  
  <!-- Open Graph (Facebook, LinkedIn) -->
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Description for social sharing">
  <meta property="og:image" content="https://gm-tc.tech/images/og-image.jpg">
  <meta property="og:url" content="https://gm-tc.tech/page/">
  <meta property="og:type" content="website">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Page Title">
  <meta name="twitter:description" content="Description for Twitter">
  <meta name="twitter:image" content="https://gm-tc.tech/images/twitter-card.jpg">
</head>
```

## Structured Data (JSON-LD)

### Website/Organization

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "gm-tc.tech",
  "url": "https://gm-tc.tech",
  "description": "Site description"
}
</script>
```

### Article/Blog Post

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "datePublished": "2024-01-15",
  "dateModified": "2024-01-16",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  }
}
</script>
```

## robots.txt

Place in web root (`/robots.txt`):

```
User-agent: *
Allow: /

Sitemap: https://gm-tc.tech/sitemap.xml
```

## sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://gm-tc.tech/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://gm-tc.tech/about/</loc>
    <lastmod>2024-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## Technical SEO Checklist

- [ ] HTTPS enabled (automatic on Uberspace)
- [ ] Mobile-friendly (responsive design)
- [ ] Fast loading (<3s)
- [ ] Canonical URLs set
- [ ] robots.txt present
- [ ] sitemap.xml submitted
- [ ] No broken links (404s)
- [ ] Proper heading hierarchy (h1 > h2 > h3)
- [ ] Alt text on images
- [ ] Descriptive URLs (slugs)

## Content Guidelines

- One unique `<h1>` per page
- Title: 50-60 characters
- Description: 150-160 characters
- Include target keywords naturally
- Internal linking between pages
- External links to authoritative sources
