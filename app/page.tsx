import Image from "next/image";
import WebCam from "./components/WebCam";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-white p-24">
      <div>
        <WebCam />
      </div>
    </main>
  );
}
