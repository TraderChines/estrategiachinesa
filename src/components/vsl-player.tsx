
"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Play } from 'lucide-react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

type VslPlayerProps = {
  videoId: string;
};

export default function VslPlayer({ videoId }: VslPlayerProps) {
  const playerRef = useRef<any>(null);
  const playerApiReady = useRef(false);
  const [showButton, setShowButton] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timeCheckInterval = useRef<NodeJS.Timeout | null>(null);

  const handleTogglePlay = () => {
    if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
      const playerState = playerRef.current.getPlayerState();
      if (playerState === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  useEffect(() => {
    const checkTime = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function' && typeof playerRef.current.getDuration === 'function') {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        const buttonAppearTime = 180; // 3 minutes

        if (duration > 0) {
          let calculatedProgress = 0;
          const videoProgress = currentTime / duration;
          
          // Fase 1 (Início Rápido): Nos primeiros 10% do tempo do vídeo, a barra deve avançar rapidamente até 60% de seu comprimento total.
          if (videoProgress <= 0.10) {
            calculatedProgress = (videoProgress / 0.10) * 60;
          }
          // Fase 2 (Meio Normal): Nos próximos 60% do tempo do vídeo, a barra deve avançar no ritmo normal, cobrindo os próximos 20% de seu comprimento (de 60% a 80%).
          else if (videoProgress <= 0.70) { 
            const timeInStage = videoProgress - 0.10;
            const progressInStage = (timeInStage / 0.60) * 20; // 20% progress (80-60)
            calculatedProgress = 60 + progressInStage;
          }
          // Fase 3 (Rápido): Nos próximos 10% do tempo do vídeo, a barra deve avançar no ritmo rapido, cobrindo os 10% restantes (de 80% a 90%).
          else if (videoProgress <= 0.80) {
            const timeInStage = videoProgress - 0.70;
            const progressInStage = (timeInStage / 0.10) * 10; // 10% progress (90-80)
            calculatedProgress = 80 + progressInStage;
          }
          // Fase 4 (Final Normal): Nos próximos 10% do tempo do vídeo, a barra deve avançar no ritmo rapido, cobrindo os 10% restantes (de 90% a 100%).
          else { 
            const timeInStage = videoProgress - 0.80;
            const progressInStage = (timeInStage / 0.20) * 10; // 10% progress (100-90)
            calculatedProgress = 90 + progressInStage;
          }
    
          setProgress(Math.min(calculatedProgress, 100));
        }

        if (currentTime >= buttonAppearTime) {
          setShowButton(true);
        }
      }
    };

    const onPlayerStateChange = (event: any) => {
      if (event.data === window.YT.PlayerState.PLAYING) {
        setIsPlaying(true);
        if (timeCheckInterval.current) {
          clearInterval(timeCheckInterval.current);
        }
        timeCheckInterval.current = setInterval(checkTime, 250);
      } else if (event.data === window.YT.PlayerState.PAUSED) {
        setIsPlaying(false);
        if (timeCheckInterval.current) {
          clearInterval(timeCheckInterval.current);
        }
      } else if (event.data === window.YT.PlayerState.ENDED) {
        setIsPlaying(false);
        setProgress(100);
        if (timeCheckInterval.current) {
          clearInterval(timeCheckInterval.current);
        }
      }
    };
    
    const onPlayerReady = (event: any) => {
        // We don't want to autoplay, so we do nothing here.
    };

    const onYouTubeIframeAPIReady = () => {
      if (playerApiReady.current) return;
      playerApiReady.current = true;
      
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          fs: 0,
          iv_load_policy: 3,
          disablekb: 1,
          loop: 1,
          playlist: videoId
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    };
    
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      } else if (window.YT.Player) {
        onYouTubeIframeAPIReady();
      }
    };

    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    loadYouTubeAPI();

    return () => {
      if (timeCheckInterval.current) {
        clearInterval(timeCheckInterval.current);
      }
    };
  }, [videoId]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl shadow-primary/20 md:p-0 p-4">
        <div id="youtube-player" className="w-full h-full"></div>
        <div 
          className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer group"
          onClick={handleTogglePlay}
        >
          {!isPlaying && (
            <div className="bg-black/50 p-4 rounded-full transition-all duration-300 group-hover:bg-black/70">
              <Play className="text-white h-8 w-8 md:h-12 md:w-12 fill-white" />
            </div>
          )}
        </div>
        <Progress value={progress} className="absolute bottom-0 w-full h-2 rounded-none" />
      </div>
      {showButton && (
        <a href="https://pay.kiwify.com.br/N2HRXHr" className="block px-4 md:px-0">
          <Button size="lg" className="w-full text-lg md:text-xl font-bold py-4 md:py-6 h-auto animate-pulse bg-yellow-400 hover:bg-yellow-500 text-black">
            QUERO ACESSAR A ESTRATÉGIA CHINESA
            <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </a>
      )}
    </div>
  );
}
