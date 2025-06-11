import { MobileParticleCanvas } from "@/components/ui/mobile-particle-canvas";
import { ParticleCanvas } from "@/components/ui/particle-canvas";
import type { Meta, StoryObj } from "@storybook/nextjs";

// Story for Desktop Particle Canvas
const desktopMeta = {
  title: "UI/ParticleCanvas/Desktop",
  component: ParticleCanvas,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Desktop-optimized particle canvas with interactive text particles and scatter effects.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof ParticleCanvas>;

export default desktopMeta;
type DesktopStory = StoryObj<typeof desktopMeta>;

// Desktop Stories
export const Desktop: DesktopStory = {
  args: {
    className: "w-full h-[600px]",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Desktop version with full-size text and interactive features. Move your mouse around to see particle repulsion and click to create scatter effects.",
      },
    },
  },
};

export const DesktopFullscreen: DesktopStory = {
  args: {
    className: "w-full h-screen",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Desktop version in fullscreen mode - similar to how it appears on the landing page.",
      },
    },
  },
};

// Story for Mobile Particle Canvas
const _mobileMeta = {
  title: "UI/ParticleCanvas/Mobile",
  component: MobileParticleCanvas,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Mobile-optimized particle canvas with condensed layout, left-aligned text, and touch-optimized interactions.",
      },
    },
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof MobileParticleCanvas>;

export const Mobile: StoryObj<typeof _mobileMeta> = {
  args: {
    className: "w-full h-[400px]",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Mobile-optimized version with larger text, left alignment, and touch interactions. Tap anywhere to create particle scatter effects.",
      },
    },
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const MobilePortrait: StoryObj<typeof _mobileMeta> = {
  args: {
    className: "w-full h-[600px]",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Mobile version in portrait orientation - simulates mobile landing page experience.",
      },
    },
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const MobileLandscape: StoryObj<typeof _mobileMeta> = {
  args: {
    className: "w-full h-[300px]",
  },
  parameters: {
    docs: {
      description: {
        story: "Mobile version in landscape orientation.",
      },
    },
    viewport: {
      defaultViewport: "mobile2",
    },
  },
};

// Comparison Story
const ComparisonComponent = () => (
  <div className="flex flex-col lg:flex-row w-full h-screen">
    <div className="flex-1 border-r border-gray-300">
      <div className="p-4 bg-gray-100 text-center font-bold">
        Desktop Version
      </div>
      <ParticleCanvas className="w-full h-[calc(100%-60px)]" />
    </div>
    <div className="flex-1">
      <div className="p-4 bg-gray-100 text-center font-bold">
        Mobile Version
      </div>
      <MobileParticleCanvas className="w-full h-[calc(100%-60px)]" />
    </div>
  </div>
);

const _comparisonMeta = {
  title: "UI/ParticleCanvas/Comparison",
  component: ComparisonComponent,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Side-by-side comparison of desktop and mobile particle canvas components.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ComparisonComponent>;

export const SideBySide: StoryObj<typeof _comparisonMeta> = {
  parameters: {
    docs: {
      description: {
        story:
          "Compare the desktop and mobile versions side by side. Notice the differences in text size, layout, and particle density.",
      },
    },
  },
};
