const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

/**
 * Generate static fallbacks from PNG screenshot files for platforms that don't support animated GIFs
 * This script looks for -static.png files and generates JPEG and WebP versions from them
 */
async function generateStaticFallbacks() {
  const inputDir = path.join(__dirname, "../public/unfurls");

  console.log(
    "🖼️  Looking for -static.png files to generate alternative formats...\n"
  );

  try {
    // Read all files in the directory
    const files = await fs.readdir(inputDir);

    // Filter for -static.png files
    const staticPngFiles = files.filter((file) => file.endsWith("-base.png"));

    if (staticPngFiles.length === 0) {
      console.log("❌ No -static.png files found in", inputDir);
      console.log(
        "\nPlease add your screenshot files with the naming pattern:"
      );
      console.log("  - hero-section-static.png");
      console.log("  - 2d-graph-static.png");
      console.log("  - etc.");
      return;
    }

    console.log(`Found ${staticPngFiles.length} PNG file(s) to process:\n`);
    staticPngFiles.forEach((file) => console.log(`  - ${file}`));
    console.log("\n");

    // Generate JPEG alternatives
    console.log("🖼️  Generating JPEG alternatives...\n");

    for (const pngFile of staticPngFiles) {
      const inputPath = path.join(inputDir, pngFile);
      const outputPath = path.join(inputDir, pngFile.replace(".png", ".jpg"));

      try {
        await sharp(inputPath)
          .jpeg({
            quality: 90,
            progressive: true,
            mozjpeg: true,
          })
          .toFile(outputPath);

        console.log(`✅ Generated JPEG: ${path.basename(outputPath)}`);

        // Get file sizes for comparison
        const pngStats = await fs.stat(inputPath);
        const jpegStats = await fs.stat(outputPath);

        console.log(`   PNG size:  ${(pngStats.size / 1024).toFixed(2)} KB`);
        console.log(`   JPEG size: ${(jpegStats.size / 1024).toFixed(2)} KB`);
        console.log(
          `   Reduction: ${(((pngStats.size - jpegStats.size) / pngStats.size) * 100).toFixed(1)}%\n`
        );
      } catch (error) {
        console.error(
          `❌ Failed to generate JPEG for ${pngFile}:`,
          error.message
        );
      }
    }

    // Generate WebP alternatives
    console.log("🖼️  Generating WebP alternatives...\n");

    for (const pngFile of staticPngFiles) {
      const inputPath = path.join(inputDir, pngFile);
      const outputPath = path.join(inputDir, pngFile.replace(".png", ".webp"));

      try {
        await sharp(inputPath)
          .webp({
            quality: 90,
            effort: 6,
          })
          .toFile(outputPath);

        console.log(`✅ Generated WebP: ${path.basename(outputPath)}`);

        const pngStats = await fs.stat(inputPath);
        const webpStats = await fs.stat(outputPath);

        console.log(`   PNG size:  ${(pngStats.size / 1024).toFixed(2)} KB`);
        console.log(`   WebP size: ${(webpStats.size / 1024).toFixed(2)} KB`);
        console.log(
          `   Reduction: ${(((pngStats.size - webpStats.size) / pngStats.size) * 100).toFixed(1)}%\n`
        );
      } catch (error) {
        console.error(
          `❌ Failed to generate WebP for ${pngFile}:`,
          error.message
        );
      }
    }

    // Generate optimized PNG versions (optional)
    console.log("🖼️  Optimizing PNG files...\n");

    for (const pngFile of staticPngFiles) {
      const inputPath = path.join(inputDir, pngFile);
      const outputPath = path.join(
        inputDir,
        pngFile.replace("-static.png", "-static-optimized.png")
      );

      try {
        await sharp(inputPath)
          .png({
            quality: 100,
            compressionLevel: 9,
            palette: true,
          })
          .toFile(outputPath);

        const originalStats = await fs.stat(inputPath);
        const optimizedStats = await fs.stat(outputPath);

        if (optimizedStats.size < originalStats.size) {
          console.log(`✅ Optimized PNG: ${path.basename(outputPath)}`);
          console.log(
            `   Original:  ${(originalStats.size / 1024).toFixed(2)} KB`
          );
          console.log(
            `   Optimized: ${(optimizedStats.size / 1024).toFixed(2)} KB`
          );
          console.log(
            `   Reduction: ${(((originalStats.size - optimizedStats.size) / originalStats.size) * 100).toFixed(1)}%\n`
          );
        } else {
          // Delete the "optimized" version if it's not smaller
          await fs.unlink(outputPath);
          console.log(`ℹ️  ${pngFile} is already optimized\n`);
        }
      } catch (error) {
        console.error(`❌ Failed to optimize ${pngFile}:`, error.message);
      }
    }

    console.log("\n🎉 Static fallback generation complete!");
    console.log("\nGenerated formats:");
    console.log("- JPEG: Best for platforms with file size limits");
    console.log("- WebP: Best compression for modern browsers");
    console.log("- PNG: Original screenshots with maximum quality");
    console.log(
      "\nThe metadata configuration will automatically use these files."
    );
  } catch (error) {
    console.error("❌ Error reading directory:", error.message);
  }
}

// Run the script
generateStaticFallbacks().catch(console.error);

/*
INSTALLATION:
npm install sharp

USAGE:
1. Take screenshots of your animations and save them as PNG files with the pattern "*-static.png"
   For example:
   - hero-section-static.png
   - 2d-graph-static.png
   
2. Place these PNG files in the public/unfurls/ directory

3. Run the script:
   node scripts/generate-static-fallbacks.js

This script will:
1. Find all files ending with "-static.png"
2. Generate JPEG versions (smaller file size, good for platforms with limits)
3. Generate WebP versions (best compression for modern browsers)
4. Attempt to optimize the PNG files further
5. Display file sizes and compression ratios

The script now uses your provided screenshots as the source instead of extracting frames from GIFs.
*/
