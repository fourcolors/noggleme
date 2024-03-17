import Main from "./components/Main";
import Image from "next/image";

export default function Home() {
  return (
    <main
      style={{ backgroundColor: "#e9cb65" }}
      className="flex min-h-screen flex-col items-center justify-between bg-white px-24"
    >
      <Image src="/logo.png" alt="logo" width={400} height={200} />
      <Main />
    </main>
  );
}
