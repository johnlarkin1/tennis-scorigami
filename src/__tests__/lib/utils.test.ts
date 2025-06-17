import { cn } from "@/components/lib/utils";

describe("cn utility function", () => {
  it("combines multiple class names", () => {
    const result = cn("class1", "class2", "class3");
    expect(result).toBe("class1 class2 class3");
  });

  it("handles conditional classes", () => {
    const result = cn(
      "base-class",
      true && "conditional-class",
      false && "hidden-class"
    );
    expect(result).toBe("base-class conditional-class");
  });

  it("merges conflicting Tailwind classes correctly", () => {
    const result = cn("px-2 px-4 py-2 py-6");
    expect(result).toBe("px-4 py-6");
  });

  it("handles arrays of classes", () => {
    const result = cn(["class1", "class2"], "class3");
    expect(result).toBe("class1 class2 class3");
  });

  it("handles objects with boolean values", () => {
    const result = cn({
      active: true,
      inactive: false,
      visible: true,
    });
    expect(result).toBe("active visible");
  });

  it("returns empty string for no inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles undefined and null values", () => {
    const result = cn("class1", undefined, null, "class2");
    expect(result).toBe("class1 class2");
  });
});
