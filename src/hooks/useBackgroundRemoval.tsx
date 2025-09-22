import { useState, useCallback } from 'react';
import { processImageFromUrl } from '@/utils/backgroundRemoval';
import { toast } from '@/hooks/use-toast';

export const useBackgroundRemoval = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<Record<string, string>>({});

  const processImage = useCallback(async (imageUrl: string): Promise<string> => {
    // Return cached result if available
    if (processedImages[imageUrl]) {
      return processedImages[imageUrl];
    }

    setIsProcessing(true);
    try {
      const processedUrl = await processImageFromUrl(imageUrl);
      setProcessedImages(prev => ({ ...prev, [imageUrl]: processedUrl }));
      toast({
        title: "Success",
        description: "Background removed successfully",
      });
      return processedUrl;
    } catch (error) {
      console.error('Background removal failed:', error);
      toast({
        title: "Error",
        description: "Failed to remove background. Using original image.",
        variant: "destructive",
      });
      return imageUrl; // Fallback to original
    } finally {
      setIsProcessing(false);
    }
  }, [processedImages]);

  return {
    processImage,
    isProcessing,
    processedImages,
  };
};