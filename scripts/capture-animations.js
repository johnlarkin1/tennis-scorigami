const puppeteer = require("puppeteer");
const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");
const path = require("path");

// Configuration
const BASE_URL = "http://localhost:3000"; // Update this to your deployment URL
const OUTPUT_DIR = "./captures";
const VIEWPORT = { width: 1200, height: 630 }; // OpenGraph recommended size

// Recording config for high-quality output
const recordingConfig = {
  followNewTab: false,
  fps: 30,
  videoFrame: {
    width: VIEWPORT.width,
    height: VIEWPORT.height,
  },
  videoCrf: 18,
  videoCodec: "libx264",
  videoPreset: "ultrafast",
  videoBitrate: 1000,
  autopad: {
    color: "#1a1b26", // Match your dark theme
  },
  aspectRatio: "1200:630",
};

async function captureAnimations() {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Create output directory if it doesn't exist
  const fs = require("fs");
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    // 1. CAPTURE LANDING PAGE PARTICLE ANIMATION
    console.log("📸 Capturing landing page particle animation...");

    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await page.waitForTimeout(2000); // Let particles initialize

    const landingRecorder = new PuppeteerScreenRecorder(page, recordingConfig);
    await landingRecorder.start(path.join(OUTPUT_DIR, "landing-particles.mp4"));

    // Simulate mouse movement for particle interaction
    for (let i = 0; i < 3; i++) {
      await page.mouse.move(
        VIEWPORT.width * 0.3 + i * 200,
        VIEWPORT.height * 0.5,
        { steps: 50 }
      );
      await page.waitForTimeout(1000);
    }

    // Hover over the tennis ball if visible
    const tennisLogo = await page.$("canvas"); // Adjust selector as needed
    if (tennisLogo) {
      const box = await tennisLogo.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
          steps: 30,
        });
        await page.waitForTimeout(2000);
      }
    }

    await landingRecorder.stop();
    console.log("✅ Landing page captured!");

    // 2. CAPTURE EXPLORE PAGE FORCE GRAPH
    console.log("📸 Capturing explore page force graph...");

    await page.goto(`${BASE_URL}/explore`, { waitUntil: "networkidle0" });
    await page.waitForTimeout(3000); // Let graph render

    const exploreRecorder = new PuppeteerScreenRecorder(page, recordingConfig);
    await exploreRecorder.start(path.join(OUTPUT_DIR, "explore-graph.mp4"));

    // Wait for graph to load
    await page.waitForSelector("canvas", { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Simulate some interactions with the graph
    // Click on a few nodes to show the interaction
    const graphCanvas = await page.$("canvas");
    if (graphCanvas) {
      const box = await graphCanvas.boundingBox();
      if (box) {
        // Move around the graph
        for (let i = 0; i < 4; i++) {
          const x = box.x + box.width * (0.3 + i * 0.15);
          const y = box.y + box.height * (0.3 + i * 0.1);

          await page.mouse.move(x, y, { steps: 30 });
          await page.waitForTimeout(500);

          // Click to potentially trigger confetti on unscored nodes
          if (i === 2) {
            await page.mouse.click(x, y);
            await page.waitForTimeout(2000); // Let confetti play
          }
        }
      }
    }

    // Try different view modes if available
    const viewButton3D = await page.$('button:has-text("3D View")');
    if (viewButton3D) {
      await viewButton3D.click();
      await page.waitForTimeout(2000);
    }

    await exploreRecorder.stop();
    console.log("✅ Explore page captured!");

    // 3. CAPTURE ABOUT PAGE
    console.log("📸 Capturing about page...");

    await page.goto(`${BASE_URL}/about`, { waitUntil: "networkidle0" });
    await page.waitForTimeout(2000);

    const aboutRecorder = new PuppeteerScreenRecorder(page, recordingConfig);
    await aboutRecorder.start(path.join(OUTPUT_DIR, "about-page.mp4"));

    // Smooth scroll through the about page
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight - window.innerHeight) {
            clearInterval(timer);
            // Scroll back to top
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(resolve, 2000);
          }
        }, 100);
      });
    });

    await aboutRecorder.stop();
    console.log("✅ About page captured!");

    // BONUS: Create a highlight reel combining all three
    console.log("📸 Creating highlight reel...");

    const highlightRecorder = new PuppeteerScreenRecorder(
      page,
      recordingConfig
    );
    await highlightRecorder.start(path.join(OUTPUT_DIR, "highlight-reel.mp4"));

    // Quick tour of all pages
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await page.waitForTimeout(2000);

    await page.goto(`${BASE_URL}/explore`, { waitUntil: "networkidle0" });
    await page.waitForTimeout(1000);
    const canvas = await page.$("canvas");
    if (canvas) {
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.click(
          box.x + box.width * 0.4,
          box.y + box.height * 0.4
        );
        await page.waitForTimeout(2000);
      }
    }

    await page.goto(`${BASE_URL}/about`, { waitUntil: "networkidle0" });
    await page.waitForTimeout(2000);

    await highlightRecorder.stop();
    console.log("✅ Highlight reel created!");
  } catch (error) {
    console.error("Error during capture:", error);
  } finally {
    await browser.close();
  }

  console.log("\n🎉 All captures complete!");
  console.log(`📁 Files saved to: ${path.resolve(OUTPUT_DIR)}`);
  console.log("\nNext steps:");
  console.log(
    '1. Convert MP4s to GIFs using: ffmpeg -i input.mp4 -vf "fps=20,scale=1200:-1:flags=lanczos" -c:v gif output.gif'
  );
  console.log("2. Or use online tools like ezgif.com for optimization");
  console.log(
    "3. Compress GIFs with gifsicle: gifsicle -O3 --colors 128 input.gif -o output.gif"
  );
}

// Helper function to create a perfect loop GIF
async function createLoopingGif(page, outputPath, duration = 5000) {
  const recorder = new PuppeteerScreenRecorder(page, recordingConfig);
  await recorder.start(outputPath);

  // Record for specified duration
  await page.waitForTimeout(duration);

  await recorder.stop();
}

// Run the capture
captureAnimations().catch(console.error);

/* 
INSTALLATION INSTRUCTIONS:
1. Install dependencies:
   npm install puppeteer puppeteer-screen-recorder

2. Update the BASE_URL to match your deployment

3. Run the script:
   node capture-animations.js

4. Convert MP4 to GIF:
   - Using FFmpeg (best quality):
     ffmpeg -i landing-particles.mp4 -vf "fps=20,scale=1200:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 landing-particles.gif
   
   - Using ImageMagick:
     convert -delay 5 -loop 0 landing-particles.mp4 landing-particles.gif
   
   - Using online tools:
     - ezgif.com (easy, good compression)
     - cloudconvert.com (high quality)

5. Optimize GIF size:
   gifsicle -O3 --colors 256 --lossy=30 landing-particles.gif -o landing-particles-optimized.gif

CUSTOMIZATION OPTIONS:
- Adjust VIEWPORT for different aspect ratios
- Modify recordingConfig.fps for smoother/smaller files
- Add more interactions in each section
- Capture specific moments (like confetti animation)
*/
