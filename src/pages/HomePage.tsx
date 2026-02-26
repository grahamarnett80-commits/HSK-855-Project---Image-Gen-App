import { useState, useEffect } from 'react';
import { Loader2, Download, Clock, Image as ImageIcon, ShoppingCart } from 'lucide-react';
import { UserMenu } from '../components/UserMenu';
import { generateImage, getRecentGenerations } from '../lib/imageService';
import { getFluxCredits } from '../lib/creditsService';
import { stripeProducts } from '../stripe-config';
import { ProductCard } from '../components/stripe/ProductCard';
import type { GenerateImageParams, ImageGeneration, ImageSize } from '../lib/types';
import type { CreditsInfo } from '../lib/creditsService';

export function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>('landscape_4_3');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{ url: string; seed: number } | null>(null);
  const [recentImages, setRecentImages] = useState<ImageGeneration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<CreditsInfo | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [showShop, setShowShop] = useState(false);

  useEffect(() => {
    loadRecentImages();
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      setLoadingCredits(true);
      const creditsData = await getFluxCredits();
      setCredits(creditsData);
    } catch (err) {
      console.error('Failed to load credits:', err);
    } finally {
      setLoadingCredits(false);
    }
  };

  const loadRecentImages = async () => {
    try {
      const images = await getRecentGenerations(12);
      setRecentImages(images);
    } catch (err) {
      console.error('Failed to load recent images:', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const params: GenerateImageParams = {
        prompt: prompt.trim(),
        imageSize,
      };

      const result = await generateImage(params);
      setGeneratedImage(result);
      await loadRecentImages();
      await loadCredits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `flux-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (showShop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="w-10 h-10 text-blue-600" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Get More Credits
                </h1>
              </div>
              <p className="text-slate-600 dark:text-slate-400">Choose a plan to continue creating stunning images</p>
            </div>

            <button
              onClick={() => setShowShop(false)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-semibold"
            >
              Back to Generator
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stripeProducts.map((product) => (
              <ProductCard key={product.priceId} product={product} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3">
              <img src="/favicon.svg" alt="" className="w-10 h-10 shrink-0" aria-hidden />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                  AI Image Studio
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Transform your ideas into stunning visuals</p>
              </div>
            </div>
          </div>

          <UserMenu />
        </header>

        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label htmlFor="prompt" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Describe your image
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="An intense close-up of knight's visor reflecting battle, sword raised, flames in background..."
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                  rows={4}
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label htmlFor="imageSize" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Image size
                </label>
                <select
                  id="imageSize"
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value as ImageSize)}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                  disabled={isGenerating}
                >
                  <option value="square_hd">Square HD</option>
                  <option value="square">Square</option>
                  <option value="portrait_4_3">Portrait 4:3</option>
                  <option value="portrait_16_9">Portrait 16:9</option>
                  <option value="landscape_4_3">Landscape 4:3</option>
                  <option value="landscape_16_9">Landscape 16:9</option>
                </select>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  {error}
                </div>
              )}

              {!loadingCredits && credits && credits.credits <= 0 && (
                <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
                  <div className="flex items-start gap-3">
                    <ShoppingCart className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Out of free generations</p>
                      <p className="text-sm text-blue-700 mb-3">Purchase additional credits to continue creating stunning images</p>
                      <button
                        onClick={() => setShowShop(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all font-semibold text-sm"
                      >
                        View Credit Packages
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim() || (credits && credits.credits <= 0)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <img src="/favicon.svg" alt="" className="w-5 h-5 opacity-90" aria-hidden />
                    Generate Image
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-700 rounded-xl border border-blue-200 dark:border-slate-600 px-6 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                    <img src="/favicon.svg" alt="" className="w-5 h-5 opacity-90" aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium uppercase tracking-wider">Free Generations</p>
                    {loadingCredits ? (
                      <p className="text-lg font-semibold text-blue-900 dark:text-slate-200">Loading...</p>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {Math.floor(credits?.credits ?? 0)}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">remaining</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowShop(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-lg"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy More Credits
              </button>
            </div>
          </div>

          {generatedImage && (
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Your Generated Image</h2>
                <button
                  onClick={() => handleDownload(generatedImage.url)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                <img
                  src={generatedImage.url}
                  alt="Generated"
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Seed: {generatedImage.seed}</p>
            </div>
          )}
        </div>

        {recentImages.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Recent Generations</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  <div className="relative aspect-video bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    {image.image_url ? (
                      <img
                        src={image.image_url}
                        alt={image.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">{image.prompt}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                      <span>{image.image_size}</span>
                      {image.seed && <span>Seed: {image.seed}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}