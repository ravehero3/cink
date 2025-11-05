import Titlebar from "@/components/Titlebar";

export default function Home() {
  return (
    <>
      <Titlebar title="UFO SPORT" />
      
      <div className="flex items-center justify-center py-20 bg-white">
        <div className="text-center text-black">
          <p className="text-body">Minimalistický černobílý e-shop</p>
          <p className="text-body mt-2">Právě probíhá vývoj...</p>
        </div>
      </div>
    </>
  );
}
