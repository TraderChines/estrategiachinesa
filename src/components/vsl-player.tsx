"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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
  const timeCheckInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkTime = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const currentTime = playerRef.current.getCurrentTime();
        // 10 seconds
        if (currentTime >= 10) {
          setShowButton(true);
          if (timeCheckInterval.current) {
            clearInterval(timeCheckInterval.current);
          }
        }
      }
    };

    const onPlayerStateChange = (event: any) => {
      if (event.data === window.YT.PlayerState.PLAYING) {
        if (timeCheckInterval.current) {
          clearInterval(timeCheckInterval.current);
        }
        timeCheckInterval.current = setInterval(checkTime, 1000);
      } else {
        if (timeCheckInterval.current) {
          clearInterval(timeCheckInterval.current);
        }
      }
    };

    const onYouTubeIframeAPIReady = () => {
      if (playerApiReady.current) return;
      playerApiReady.current = true;
      
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          fs: 0,
          iv_load_policy: 3,
          disablekb: 1,
        },
        events: {
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
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl shadow-primary/20">
        <div id="youtube-player" className="w-full h-full"></div>
      </div>
      {showButton && (
        <a href="https://pay.kiwify.com.br/N2HRXHr" className="block">
          <Button size="lg" className="w-full text-xl font-bold py-8 animate-pulse">
            QUERO ACESSAR O INDICADOR CHINÊS
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </a>
      )}
    </div>
  );
}
