import { cleanFullResponse } from "@/ipc/utils/cleanFullResponse";
import { describe, it, expect } from "vitest";

describe("cleanFullResponse", () => {
  it("should replace < characters in vexa-write attributes", () => {
    const input = `<vexa-write path="src/file.tsx" description="Testing <a> tags.">content</vexa-write>`;
    const expected = `<vexa-write path="src/file.tsx" description="Testing ＜a＞ tags.">content</vexa-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should replace < characters in multiple attributes", () => {
    const input = `<vexa-write path="src/<component>.tsx" description="Testing <div> tags.">content</vexa-write>`;
    const expected = `<vexa-write path="src/＜component＞.tsx" description="Testing ＜div＞ tags.">content</vexa-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle multiple nested HTML tags in a single attribute", () => {
    const input = `<vexa-write path="src/file.tsx" description="Testing <div> and <span> and <a> tags.">content</vexa-write>`;
    const expected = `<vexa-write path="src/file.tsx" description="Testing ＜div＞ and ＜span＞ and ＜a＞ tags.">content</vexa-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle complex example with mixed content", () => {
    const input = `
      BEFORE TAG
  <vexa-write path="src/pages/locations/neighborhoods/louisville/Highlands.tsx" description="Updating Highlands neighborhood page to use <a> tags.">
import React from 'react';
</vexa-write>
AFTER TAG
    `;

    const expected = `
      BEFORE TAG
  <vexa-write path="src/pages/locations/neighborhoods/louisville/Highlands.tsx" description="Updating Highlands neighborhood page to use ＜a＞ tags.">
import React from 'react';
</vexa-write>
AFTER TAG
    `;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle other vexa tag types", () => {
    const input = `<vexa-rename from="src/<old>.tsx" to="src/<new>.tsx"></vexa-rename>`;
    const expected = `<vexa-rename from="src/＜old＞.tsx" to="src/＜new＞.tsx"></vexa-rename>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle vexa-delete tags", () => {
    const input = `<vexa-delete path="src/<component>.tsx"></vexa-delete>`;
    const expected = `<vexa-delete path="src/＜component＞.tsx"></vexa-delete>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should not affect content outside vexa tags", () => {
    const input = `Some text with <regular> HTML tags. <vexa-write path="test.tsx" description="With <nested> tags.">content</vexa-write> More <html> here.`;
    const expected = `Some text with <regular> HTML tags. <vexa-write path="test.tsx" description="With ＜nested＞ tags.">content</vexa-write> More <html> here.`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle empty attributes", () => {
    const input = `<vexa-write path="src/file.tsx">content</vexa-write>`;
    const expected = `<vexa-write path="src/file.tsx">content</vexa-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle attributes without < characters", () => {
    const input = `<vexa-write path="src/file.tsx" description="Normal description">content</vexa-write>`;
    const expected = `<vexa-write path="src/file.tsx" description="Normal description">content</vexa-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });
});
