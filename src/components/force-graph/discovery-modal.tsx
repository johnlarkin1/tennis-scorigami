"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NodeDTO } from "@/lib/types";
import { Check, Copy, Download, Share2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface DiscoveryModalProps {
  node: NodeDTO;
  onClose: () => void;
}

export function DiscoveryModal({ node, onClose }: DiscoveryModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);

  useEffect(() => {
    // Check if Web Share API is supported
    setShareSupported(!!navigator.share);
  }, []);

  // Generate a celebratory message
  const getMessage = () => {
    const messages = [
      "You've discovered a unique tennis score sequence!",
      "This score pattern has never been recorded in a match!",
      "You're the first to find this undiscovered score sequence!",
      "Tennis history in the making - this sequence is brand new!",
      "A statistical rarity - you've uncovered an unplayed sequence!",
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Format the discovery for sharing
  const discoveryText = `🎾 Tennis History Discovery! 🎾\n\nI discovered a tennis score sequence that has never been played in a recorded match:\n\n${node.slug}\n\nCheck out the Tennis Score Explorer to find your own unique sequences!`;

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(discoveryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  // Share function using Web Share API
  const shareDiscovery = async () => {
    try {
      await navigator.share({
        title: "Tennis Score Discovery",
        text: discoveryText,
      });
    } catch (err) {
      console.error("Failed to share: ", err);
    }
  };

  // Download discovery certificate as PNG
  const downloadCertificate = () => {
    // This would normally generate a certificate image
    // For now we'll just use an alert
    alert("Certificate download functionality would go here!");
    // In a real implementation, you would:
    // 1. Create a canvas or use html-to-image
    // 2. Draw a certificate with the discovery details
    // 3. Convert to PNG and trigger download
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-gray-900 to-gray-800 border-red-600 border-2 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.3)] text-white">
        <DialogHeader className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mb-2 animate-bounce">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-red-400">
            Historic Discovery!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-center text-white font-medium">{getMessage()}</p>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex flex-col items-center">
            <span className="text-gray-400 text-sm mb-1">Score Sequence:</span>
            <span className="text-2xl font-mono font-bold text-red-400">
              {node.slug}
            </span>
            <div className="flex gap-2 mt-3">
              <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                Depth: {node.depth}
              </span>
              <span className="text-xs bg-red-900 px-2 py-1 rounded">
                Unscored
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-900/40 to-red-800/40 rounded-lg p-4 text-sm text-center">
            <p>
              This sequence could happen in a future match. You might witness
              tennis history!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-600 flex items-center justify-center gap-2"
              onClick={copyToClipboard}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy"}
            </Button>

            {shareSupported ? (
              <Button
                variant="outline"
                className="bg-red-800 hover:bg-red-700 text-white border-red-600 flex items-center justify-center gap-2"
                onClick={shareDiscovery}
              >
                <Share2 size={16} />
                Share
              </Button>
            ) : (
              <Button
                variant="outline"
                className="bg-red-800 hover:bg-red-700 text-white border-red-600 flex items-center justify-center gap-2"
                onClick={downloadCertificate}
              >
                <Download size={16} />
                Certificate
              </Button>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 pt-2">
          Data based on professional tennis matches from the selected datasets.
        </div>
      </DialogContent>
    </Dialog>
  );
}
