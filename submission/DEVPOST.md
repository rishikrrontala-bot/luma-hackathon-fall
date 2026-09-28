# Muslin — Devpost submission copy

## Tagline
Know how a secondhand find compares with the clothes you already wear.

## Inspiration
Buying used clothes online should be an easy way to save money and keep clothes in circulation. The uncertainty is fit. A size label tells you little about the cut, and two sellers can measure the same garment differently. I wanted a comparison grounded in a piece of clothing you already know fits.

## What it does
Muslin lets a buyer compare a listing's pit-to-pit, length, shoulder, and sleeve measurements with a reference garment. Edit the listing measurements and the differences update immediately. Switch the reference garment to see how the same listing compares with another fit. A measurement preview shows the intended photo workflow and labels its sample values clearly.

## How I built it
The interface is React, TypeScript, and Vite. Its measurement engine is a separate TypeScript pipeline: find a Letter or A4 sheet for scale, correct perspective, segment the garment, locate landmarks, and estimate dimensions with uncertainty. The live interface currently uses a seeded preview; its photo analysis engine is not connected to that screen. The fit comparison is interactive and runs in the browser without an account or server.

## Challenges and what I learned
The hard part is treating a photo measurement as an estimate. Camera angle, the paper reference, fabric edges, and seller technique can all move the result. I split the geometry and image processing into small functions and kept uncertainty visible instead of presenting a false exact answer. I also learned to give judges a reliable sample path while being explicit about what remains to be integrated.

## Business model and scale
The proposed buyer tool is free. Sellers who list many garments could pay for batch measuring, reusable listing templates, and exports. An illustrative $12/month seller plan with an assumed $1/month in incremental hosting and support costs leaves $11/month before acquisition and fixed costs; those assumptions still need customer validation. Since comparison runs locally, serving additional buyers does not require a per-comparison cloud inference call. A production seller service would need storage, authentication, support, and billing.

## What's next
Connect the existing photo pipeline to image upload in the interface; test it against varied real garments, backgrounds, and camera angles; let buyers save their own reference garments; then pilot seller tools with a small group of secondhand shops.

## Important limits
Muslin does not guarantee that a garment will fit. Stretch, drape, body shape, alteration, and inaccurate seller measurements remain outside the current comparison. The displayed photo measurements and closet items are samples in this submission build.

## Built with
React, TypeScript, Vite, CSS, Vitest, computer vision, geometry

## Links
- Live demo: https://rishikrrontala-bot.github.io/luma-hackathon-fall/
- Code: https://github.com/rishikrrontala-bot/luma-hackathon-fall
- Five-minute video: add public or unlisted video URL here
