import { describe, it, expect } from "vitest";
import testImage from "./imgs/Receipt_InNOut.jpg";

describe("Image test", () => {
  it("should import the image correctly", () => {
    console.log(testImage); // "/path/to/your/image.jpg"
    expect(typeof testImage).toBe("string");
    expect(testImage).toContain("Receipt_InNOut.jpg");
  });
});
