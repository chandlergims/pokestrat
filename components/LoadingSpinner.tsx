'use client';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f6fb' }}>
      <div className="flex flex-col items-center gap-6">
        <img 
          src="/Vibeify-Logo-png-file (1).png" 
          alt="Vibeify" 
          className="h-24 w-auto animate-pulse"
        />
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    </div>
  );
}
