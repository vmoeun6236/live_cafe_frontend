import { Loader2 } from "lucide-react";

export default function ModernLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="relative flex flex-col items-center">
        
        {/* Outer Glow */}
        <div className="absolute h-32 w-32 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />

        {/* Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="h-24 w-24 rounded-full border-4 border-gray-800 border-t-purple-500 animate-spin" />

          <div className="absolute h-16 w-16 rounded-full border-4 border-gray-700 border-b-pink-500 animate-spin [animation-direction:reverse] [animation-duration:1.2s]" />

          <Loader2 className="absolute h-8 w-8 text-white animate-pulse" />
        </div>

        {/* Loading Text */}
        <p className="mt-6 text-sm tracking-[0.3em] uppercase text-gray-400 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}