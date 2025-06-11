# Unfurl Images

This directory contains images used for social media link previews (unfurls).

## Files

### Animated GIFs (for platforms that support them)
- `hero-section.gif` - Main animated preview showing particle animation
- `2d-graph.gif` - Interactive graph visualization

### Static Fallbacks (for platforms that don't support GIFs)
- `*-static.png` - High-quality PNG screenshots (source files)
- `*-static.jpg` - JPEG versions (smaller file size, ~80% reduction)
- `*-static.webp` - WebP versions (best compression, ~85% reduction)
- `*-static-optimized.png` - Optimized PNG versions (when smaller than original)

## Platform Support

| Platform | GIF Support | Image Used |
|----------|-------------|------------|
| Discord | ✅ Animated | hero-section.gif |
| Slack | ✅ Animated | hero-section.gif |
| LinkedIn | ✅ Animated | hero-section.gif |
| Twitter | ❌ Static only | hero-section-static.png |
| Facebook | ❌ Static only | hero-section-static.png |
| iMessage | ❌ Static only | hero-section-static.png |
| WhatsApp | ❌ Static only | hero-section-static.png |

## Creating and Updating Static Fallbacks

### 1. Take Screenshots
Take high-quality screenshots of your animations at the desired moment and save them as:
- `hero-section-static.png`
- `2d-graph-static.png`
- etc.

### 2. Generate Alternative Formats
Run the generation script to create JPEG and WebP versions:

```bash
node scripts/generate-static-fallbacks.js
```

This script will:
- Find all `*-static.png` files
- Generate JPEG versions (90% quality, progressive)
- Generate WebP versions (90% quality, high effort)
- Create optimized PNG versions (if they're smaller)
- Display file sizes and compression ratios

### 3. File Size Comparison (Example)
- PNG: ~700-750 KB (original screenshots)
- JPEG: ~120-140 KB (80-85% reduction)
- WebP: ~95-115 KB (85-87% reduction)
- Optimized PNG: ~150-220 KB (70-80% reduction)