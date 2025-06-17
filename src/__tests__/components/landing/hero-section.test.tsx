import { render, screen } from "@testing-library/react";
import HeroSection from "@/components/landing/hero-section";

jest.mock("@/components/ui/particle-canvas", () => ({
  ParticleCanvas: ({ className }: { className?: string }) => (
    <div data-testid="particle-canvas" className={className}>
      Particle Canvas Mock
    </div>
  ),
}));

describe("HeroSection", () => {
  it("renders the hero section with correct structure", () => {
    render(<HeroSection />);

    const section = document.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass(
      "relative",
      "w-full",
      "h-[20vh]",
      "sm:h-[32vh]",
      "overflow-hidden",
      "bg-gray-900"
    );
  });

  it("renders the ParticleCanvas component", () => {
    render(<HeroSection />);

    const particleCanvas = screen.getByTestId("particle-canvas");
    expect(particleCanvas).toBeInTheDocument();
    expect(particleCanvas).toHaveClass(
      "absolute",
      "inset-0",
      "w-full",
      "h-full"
    );
  });

  it("applies custom className when provided", () => {
    const customClass = "custom-hero-class";
    render(<HeroSection className={customClass} />);

    const section = document.querySelector("section");
    expect(section).toHaveClass(customClass);
  });
});
