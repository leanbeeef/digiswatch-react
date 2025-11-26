import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, author, url, image }) => {
    const siteTitle = "DigiSwatch";
    const fullTitle = title ? `${title} | ${siteTitle}` : "DigiSwatch – Free Color Palette Generator";
    const defaultDescription = "DigiSwatch is a free color palette generator for designers. Build custom color schemes, save and share palettes, and find perfect matching colors.";
    const defaultKeywords = "color palette generator, color scheme, web design, hex codes, color contrast, accessibility tool, image color picker";
    const siteUrl = "https://digiswatch.io";
    const defaultImage = "https://digiswatch.io/og-image.png";

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <meta name="keywords" content={keywords || defaultKeywords} />
            <meta name="author" content={author || "DigiSwatch"} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url ? `${siteUrl}${url}` : siteUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={image || defaultImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url ? `${siteUrl}${url}` : siteUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description || defaultDescription} />
            <meta property="twitter:image" content={image || defaultImage} />

            {/* Canonical */}
            <link rel="canonical" href={url ? `${siteUrl}${url}` : siteUrl} />
        </Helmet>
    );
};

export default SEO;
