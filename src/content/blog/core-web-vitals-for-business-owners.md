---
title: "Core Web Vitals explained for business owners: LCP, INP and CLS"
metaTitle: "Core Web Vitals for Business Owners: LCP, INP | Akrostech"
description: "What LCP, INP and CLS measure, the thresholds Google uses, why they matter for sales and search, and the fixes that move them, explained without the jargon."
excerpt: "Google measures how fast your pages feel with three numbers. Here is what each one means in plain language, the thresholds that count as good, and what fixes them."
published: 2026-07-14
category: Web development
tags: [Core Web Vitals, performance, SEO]
art: web
artVariant: 6
related: [business-website-cost, virtual-assistant-tasks-to-delegate]
---

Core Web Vitals are three measurements Google uses to judge how fast and stable your pages feel to real visitors. They feed into search ranking, but the more important reason to care is simpler: slow, jumpy pages lose customers before they read a word.

Here is what each one measures, the thresholds that count as good, and what usually fixes them.

## The three numbers

| Metric | What it measures | Good | Needs improvement | Poor |
| --- | --- | --- | --- | --- |
| LCP, Largest Contentful Paint | How long until the main content appears | 2.5 s or less | up to 4 s | over 4 s |
| INP, Interaction to Next Paint | How quickly the page responds to taps and clicks | 200 ms or less | up to 500 ms | over 500 ms |
| CLS, Cumulative Layout Shift | How much the page jumps around while loading | 0.1 or less | up to 0.25 | over 0.25 |

Google assesses each metric at the 75th percentile of real visits, so three out of four visitors need a good experience for the page to pass.

## LCP: does the page show up quickly?

LCP is the moment the biggest thing on screen, usually a hero image or headline, finishes rendering. It is what a visitor experiences as "the page has loaded".

**Common causes of a slow LCP**

- Large, uncompressed hero images
- Web fonts that block text from showing
- Slow servers or no CDN
- Render-blocking scripts and stylesheets in the page head

**Fixes that work**

- Serve images in modern formats such as AVIF and WebP, sized for each screen.
- Load the hero image first and lazy-load everything below the fold.
- Preload the main font and use a matched fallback so text appears immediately.
- Host on a CDN and pre-render pages where you can.

## INP: does the page respond when I tap?

INP measures the delay between an interaction, such as tapping a menu or submitting a form, and the screen updating. A poor INP feels like a page that ignores you.

**Common causes**

- Heavy JavaScript running on the main thread
- Third-party scripts: chat widgets, trackers, tag managers
- Large page builders shipping code for features you do not use

**Fixes that work**

- Remove or defer third-party scripts that do not earn their place.
- Split JavaScript so each page loads only what it needs.
- Break long tasks into smaller pieces so the browser can respond in between.

## CLS: does the page stay still?

CLS adds up how much visible content moves unexpectedly while the page loads. It is the button that jumps just as you tap it.

**Common causes**

- Images and embeds without dimensions
- Ads and banners injected above content
- Fonts that swap in with different sizes

**Fixes that work**

- Always set width and height, or an aspect ratio, on images, videos and iframes.
- Reserve space for anything that loads late.
- Use font fallbacks adjusted to match the web font's size.

## How to check your own site

- **PageSpeed Insights** shows real-visitor data from the Chrome UX Report for your pages, plus a lab test with suggestions.
- **Google Search Console** has a Core Web Vitals report that groups pages by status across your whole site.
- **Lighthouse** in Chrome DevTools runs a lab test on any page.

Real-visitor data is what Google uses. Lab tests are for diagnosing why.

## Why this matters for a business

A faster page is shown to more people and keeps more of the people it is shown to. It also tends to be a better-built page overall: one that loads what it needs, respects the visitor's device and is easier to maintain.

## Getting it fixed

Most sites fail Core Web Vitals for a few fixable reasons: oversized images, too many third-party scripts and missing image dimensions. A focused [performance optimisation](/services/website-development) project measures real-user data, fixes issues in order of impact and reports before-and-after numbers.

If your site is failing, [book a call](/contact) and we will review your PageSpeed Insights report with you.
