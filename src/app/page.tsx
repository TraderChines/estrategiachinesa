
'use client';

import { useState } from 'react';
import VslPlayer from '@/components/vsl-player';

export default function Home() {
  const [videoEnded, setVideoEnded] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center bg-background font-body text-white">
      <header className="fixed top-0 z-20 w-full bg-red-600 p-2 text-center">
        <p className="text-sm font-bold text-white md:text-base">
          ATENÇÃO: SEU ACESSO SERÁ LIBERADO NO FINAL DO VÍDEO!
        </p>
      </header>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 pt-16 text-center">
        <h1 className="text-3xl font-bold uppercase md:text-4xl lg:text-5xl">
          Descubra o gatilho mais
          <br />
          <span className="text-primary"> assertivo no daytrade</span>
        </h1>
        
        <div className="mt-8 w-full max-w-4xl">
          <VslPlayer onVideoEnd={() => setVideoEnded(true)} />
        </div>
      </main>
    </div>
  );
}
