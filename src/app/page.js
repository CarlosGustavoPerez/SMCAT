import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          ¡Hola Mundo!
        </h1>
        <p className="text-xl text-white/80">
          Mi primer proyecto con Next.js y React
        </p>
      </div>
    </div>
  );
}
