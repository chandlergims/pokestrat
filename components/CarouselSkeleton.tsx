export function CarouselSkeleton() {
  const SkeletonCard = ({ opacity = 1, scale = 1, zIndex = 1 }: { opacity?: number; scale?: number; zIndex?: number }) => (
    <div 
      className="absolute"
      style={{
        width: "380px",
        height: "480px",
        top: "50%",
        left: "50%",
        marginLeft: "-190px",
        marginTop: "-240px",
        opacity,
        transform: `scale(${scale})`,
        zIndex,
      }}
    >
      <div className="rounded-3xl overflow-hidden shadow-2xl h-full bg-white p-6 flex flex-col animate-pulse">
        {/* Social Icons Skeleton */}
        <div className="absolute top-6 left-6 flex gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Market Cap Skeleton */}
        <div className="absolute top-6 right-6">
          <div className="w-12 h-3 bg-gray-200 rounded mb-1"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />
        
        {/* Coin Image Skeleton */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 mb-3"></div>
          
          {/* Coin Info Skeleton */}
          <div className="space-y-2 w-full">
            <div className="text-center">
              <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-5 w-16 bg-gray-200 rounded mx-auto"></div>
            </div>
            
            {/* Description Skeleton */}
            <div className="space-y-2 mt-4">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6 mx-auto"></div>
            </div>
          </div>
        </div>
        
        {/* Bottom spacer */}
        <div className="flex-1" />
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden" style={{ perspective: "1000px" }}>
      <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
        {/* Center card */}
        <SkeletonCard opacity={1} scale={1} zIndex={50} />
        
        {/* Left cards */}
        <div style={{ transform: "translateX(-420px) translateZ(-60px) scale(0.9)", position: "absolute", top: "50%", left: "50%", marginLeft: "-190px", marginTop: "-240px", opacity: 0.6, zIndex: 40 }}>
          <div className="w-[380px] h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-white p-6 flex flex-col animate-pulse">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </div>
        
        <div style={{ transform: "translateX(-840px) translateZ(-120px) scale(0.85)", position: "absolute", top: "50%", left: "50%", marginLeft: "-190px", marginTop: "-240px", opacity: 0.3, zIndex: 30 }}>
          <div className="w-[380px] h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-white p-6 flex flex-col animate-pulse">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </div>
        
        {/* Right cards */}
        <div style={{ transform: "translateX(420px) translateZ(-60px) scale(0.9)", position: "absolute", top: "50%", left: "50%", marginLeft: "-190px", marginTop: "-240px", opacity: 0.6, zIndex: 40 }}>
          <div className="w-[380px] h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-white p-6 flex flex-col animate-pulse">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </div>
        
        <div style={{ transform: "translateX(840px) translateZ(-120px) scale(0.85)", position: "absolute", top: "50%", left: "50%", marginLeft: "-190px", marginTop: "-240px", opacity: 0.3, zIndex: 30 }}>
          <div className="w-[380px] h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-white p-6 flex flex-col animate-pulse">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
