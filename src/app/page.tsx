
'use client';

import { useState } from 'react';
import VslPlayer from '@/components/vsl-player';

export default function Home() {
  const [videoEnded, setVideoEnded] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center">
      <header className="fixed top-0 left-0 right-0 z-10 w-full bg-red-600 p-2 text-center">
        <p className="font-bold text-white text-sm sm:text-base">
          ATENÇÃO: SEU ACESSO SERÁ LIBERADO NO FINAL DO VÍDEO!
        </p>
      </header>

      <main className="flex w-full flex-1 flex-col items-center px-4 pt-20 pb-8 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-tight md:text-4xl lg:text-5xl">
          Descubra o gatilho mais
          <br />
          <span className="text-primary">certeiro do mercado</span>
        </h1>

        <div className="mt-8 w-full max-w-4xl">
          <VslPlayer onVideoEnd={() => setVideoEnded(true)} />
        </div>
      </main>
    </div>
  );
}
