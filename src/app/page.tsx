import DamasgochiUI from "../../game/DamasgochiUI";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/bg.png")' }}
      >
        {/* Optional overlay to make the game stand out */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]"></div>
      </div>

      {/* <h1 className="mb-8 text-4xl font-black text-blue-500 tracking-tighter drop-shadow-lg z-10">
        DAMASGOCHI <span className="text-gray-500/50">v1.0</span>
      </h1> */}
      <div className="z-10">
        <DamasgochiUI />
      </div>
    </div>
  );
}
