"use client";

import { ArtworkData } from "@/lib/ai-chat/types";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ArtworkPreviewProps {
  artwork: ArtworkData;
}

export function ArtworkPreview({ artwork }: ArtworkPreviewProps) {
  return (
    <Card className="h-full max-w-lg mx-auto bg-black/60 border-[#D2B877]/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold truncate text-white">
          {artwork.title}
        </CardTitle>
        {artwork.artist && (
          <Badge variant="secondary" className="w-fit bg-[#D2B877]/20 text-[#D2B877] border-[#D2B877]/30">
            {artwork.artist}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full aspect-square overflow-hidden rounded-lg border border-[#D2B877]/30">
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        {artwork.description && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-[#D2B877]">Description</h4>
            <p className="text-sm leading-relaxed text-white/80">{artwork.description}</p>
          </div>
        )}
        
        {artwork.metadata && Object.keys(artwork.metadata).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-[#D2B877]">Details</h4>
            <div className="space-y-1">
              {Object.entries(artwork.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-white/60 capitalize">{key}:</span>
                  <span className="font-medium text-white/80">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 