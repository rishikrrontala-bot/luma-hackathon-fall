import { describe, expect, it } from 'vitest';
import { analyzePhoto } from '../src/cv/pipeline';
import { guessPaperSize, orderCorners } from '../src/cv/paper';
import { defaultPaperForLocale, PAPER_SIZES } from '../src/domain/paper';
import { silhouetteFromMeasurements } from '../src/domain/silhouette';

describe('measurement safety and scale', () => {
  it('does not invent garment measurements without a scale reference', () => {
    const width = 64;
    const height = 64;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i + 1] = data[i + 2] = 90;
      data[i + 3] = 255;
    }
    const result = analyzePhoto({ width, height, data }, { paper: 'auto', defaultPaper: 'letter', garment: 'auto' });
    expect(result.measurements).toEqual([]);
    expect(result.warnings).toContain('paper-not-found');
  });

  it('distinguishes A4 from Letter by aspect ratio', () => {
    expect(guessPaperSize(PAPER_SIZES.a4.long / PAPER_SIZES.a4.short)).toBe('a4');
    expect(guessPaperSize(PAPER_SIZES.letter.long / PAPER_SIZES.letter.short)).toBe('letter');
    expect(guessPaperSize(2)).toBeNull();
  });

  it('orders perspective corners consistently', () => {
    const corners = [
      { x: 85, y: 130 },
      { x: 12, y: 10 },
      { x: 100, y: 15 },
      { x: 5, y: 120 },
    ];
    expect(orderCorners(corners)).toEqual([corners[1], corners[2], corners[0], corners[3]]);
  });
});

describe('fit-check inputs', () => {
  it('requires enough listing data to construct an outline', () => {
    expect(silhouetteFromMeasurements('top', { pitToPit: 500 })).toBeNull();
    expect(silhouetteFromMeasurements('bottom', { waist: 410 })).toBeNull();
    expect(silhouetteFromMeasurements('top', { pitToPit: 500, length: 690 })?.truth.pitToPit).toBeDefined();
    expect(silhouetteFromMeasurements('bottom', { waist: 410, inseam: 790 })?.truth.inseam).toBeDefined();
  });

  it('chooses the local paper default', () => {
    expect(defaultPaperForLocale('en-US')).toBe('letter');
    expect(defaultPaperForLocale('fr-FR')).toBe('a4');
  });
});
