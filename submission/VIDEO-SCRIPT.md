# Muslin — five-minute demo narration

Synthetic narration. The browser preview uses seeded sample values; the vision pipeline is separate and is not wired to the UI.

## OPEN — Would this hoodie fit?

Imagine finding a secondhand hoodie you love, but the listing says only medium. Muslin starts with a better question: how does it compare with the hoodie you already wear? This opening is a product preview using clearly labeled sample measurements.

## PROBLEM — A size label is not a measurement.

A medium from one brand can fit differently from a medium from another. That uncertainty matters even more for secondhand clothes, where returns may be limited and sellers often measure items by hand. Buyers need a reference they understand: the garments already in their own closet.

## IDEA — Your closet becomes the size chart.

Muslin has three steps. First, measure a flat garment beside a standard sheet of paper. Second, keep the clothes that fit as personal reference items. Third, compare a seller listing dimension by dimension. A simple verdict helps, but the underlying centimetre differences stay visible.

## BUILD — A local vision pipeline.

The technical core is written in TypeScript and organized as pure functions. It accepts image pixels, detects the reference sheet, corrects perspective, separates the garment from the floor, estimates landmarks, and reports measurements with uncertainty. This pipeline exists in source code today. The browser interface currently uses seeded values for its visual preview.

## BUILD — Paper sets the scale.

A sheet of Letter or A four paper provides a known size. The paper detector looks for a light quadrilateral. The geometry module maps four corners into a flat plane, so distances can be estimated even when the camera is angled. Detection confidence and aspect mismatch are represented as warnings.

## BUILD — From pixels to measurements.

The garment stage models the surrounding floor, thresholds the difference, and traces a contour. Landmark code searches that contour for points such as shoulders, pits, hem, and sleeve ends. The measurement module returns a value and a plus or minus range. Photo accuracy still needs validation on varied real garments.

## DEMO — Start with a known garment.

Now for the live browser flow. I am opening the measurement preview. These are seeded sample values, not measurements computed from a photo in this interface. The tags show the intended result: pit to pit, length, shoulder, and sleeve, each with an uncertainty label instead of false precision.

## DEMO — Read the measurement tags.

The preview puts dimensions over the garment shape, then repeats them in a readable list. A shopper can understand what each number refers to. For a production release, this screen needs to connect to the vision pipeline and let the person correct detected endpoints. The current preview makes the experience testable while that integration remains open.

## DEMO — Compare the listing.

I move to the fit check and enter measurements from a seller listing. The reference is my favourite hoodie. Muslin shows two silhouettes and gives differences for chest, length, shoulder, and sleeve. This listing is just over two centimetres wider through the chest. That is more useful than the word medium.

## DEMO — Change a number. See the consequence.

If the seller corrects the chest measurement, the difference updates immediately. The same works for length and shoulder. The verdict is deliberately simple, and detailed values remain on screen. A buyer can decide whether a looser chest is welcome, instead of relying on an opaque fit score.

## DEMO — The rack holds the reference.

The rack shows three sample garments with different measurements. Selecting another one changes what the listing is compared against. These examples live in the browser interface. Persistent personal closet storage has not been implemented yet. That is a clear next step before this can serve real shoppers.

## SCALE — Compute on the device.

The planned architecture performs image processing on a buyer or seller device. That avoids uploading personal closet photos and means more users do not require more image processing servers. A public listing link would need a compact shareable measurement record. Validation, accessibility, and performance work would be needed before a wider launch.

## BUSINESS — Free for buyers. Tools for sellers.

The proposed business model keeps buyer comparison free. Sellers could pay for batch measurement, reusable listing text, and exports. Those paid tools are a roadmap, not features in this prototype. Before pricing, I would test whether sellers save enough time to pay and whether buyers trust the measurements enough to use them.

## CLOSE — Make uncertainty visible.

Muslin cannot promise a perfect fit. Fabric stretch, drape, body shape, and seller errors still matter. It can replace a vague size label with a comparison against clothes someone already knows. This prototype demonstrates that decision flow and a separate vision core, with remaining integration work stated plainly. Built by Rishik Rontala.
