# Vercel Web Analytics Setup Guide

This document describes the Vercel Web Analytics integration in the p5.databrush project.

## Overview

Vercel Web Analytics has been integrated into the p5.databrush project to track visitor behavior and page views. This guide explains how the analytics have been set up and how to manage them.

## What is Vercel Web Analytics?

Vercel Web Analytics is a privacy-first analytics solution that provides insights into your website's performance without requiring user consent for basic analytics. It tracks:

- Visitor count and pageviews
- Performance metrics
- User interaction data
- Geographic information

## Implementation Details

Since p5.databrush is a static HTML/JavaScript site, the analytics integration uses the plain HTML implementation provided by Vercel Web Analytics.

### Added Script

The following script has been added to all HTML files (`index.html`, `brush-scatter.html`, and `brush-boxplot.html`) in the `<head>` section:

```html
<!-- Vercel Web Analytics -->
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

This script:
1. Initializes the `window.va` function to queue analytics calls
2. Loads the Vercel analytics tracking script from `/_vercel/insights/script.js` (available after deployment to Vercel)

### Important Notes

- **No Route Support**: The HTML implementation does not provide automatic route detection like framework-specific implementations (Next.js, React, Vue, etc.)
- **No Package Installation**: Unlike other frameworks, the plain HTML implementation does not require installing the `@vercel/analytics` package
- **Vercel Deployment Required**: The analytics script will only be available after deploying to Vercel. The `/_vercel/insights/script.js` endpoint is provided by Vercel's hosting platform

## Setup Requirements

1. **Vercel Account**: You need a Vercel account. [Sign up for free](https://vercel.com/signup)
2. **Vercel Project**: Your project must be created on Vercel. [Create a new project](https://vercel.com/new)
3. **Enable Web Analytics**: On the [Vercel dashboard](https://vercel.com/dashboard):
   - Select your project
   - Click the **Analytics** tab
   - Click **Enable** in the dialog

> **Note**: Enabling Web Analytics will add new routes scoped at `/_vercel/insights/*` after your next deployment.

## Viewing Analytics Data

Once your app is deployed to Vercel and users have visited your site:

1. Go to your [Vercel dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click the **Analytics** tab

After a few days of visitor data, you'll be able to start exploring your data by viewing and filtering the panels.

## Verification

To verify that Web Analytics is working correctly after deployment:

1. Visit any page of your deployed application
2. Open your browser's Network tab (Developer Tools)
3. Look for a Fetch/XHR request to `/_vercel/insights/view`
4. If present, analytics are being tracked successfully

## Privacy and Compliance

Vercel Web Analytics is designed to respect user privacy:

- No cookies required for basic analytics
- GDPR compliant
- No personal data collection
- No user consent required for basic analytics

For more information, see [Privacy and Compliance Standards](/docs/analytics/privacy-policy)

## Additional Features

### Custom Events (Pro/Enterprise)

Users on Pro and Enterprise plans can add custom events to track specific user interactions such as:
- Button clicks
- Form submissions
- Purchases
- Custom conversions

For more details, see [Custom Events Guide](/docs/analytics/custom-events)

## Next Steps

- [Learn more about the @vercel/analytics package](/docs/analytics/package)
- [Set up custom events](/docs/analytics/custom-events)
- [Learn about filtering data](/docs/analytics/filtering)
- [Explore pricing and limits](/docs/analytics/limits-and-pricing)
- [Troubleshooting](/docs/analytics/troubleshooting)

## Deployment

To deploy your app with analytics enabled:

```bash
vercel deploy
```

Or connect your Git repository to Vercel for automatic deployments of your latest commits to main.

Once deployed, the analytics tracking will begin automatically.
