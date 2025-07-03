"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

type VslPlayerProps = {
  videoId: string;
  checkoutUrl: string;
};

export default function VslPlayer({ videoId, checkoutUrl }: VslPlayerProps) {
  const [showButton, setShowButton] = useState(false);
  const playerRef = useRef<any>(null);
  const timeCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerApiReady = useRef(false);

  useEffect(() => {
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
          'onStateChange': onPlayerStateChange,
        },
      });
    };

    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    loadYouTubeAPI();

    return () => {
      if (timeCheckIntervalRef.current) {
        clearInterval(timeCheckIntervalRef.current);
      }
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      if (timeCheckIntervalRef.current) {
        clearInterval(timeCheckIntervalRef.current);
      }
      
      timeCheckIntervalRef.current = setInterval(() => {
        const currentTime = playerRef.current?.getCurrentTime();
        if (currentTime >= 30) {
          setShowButton(true);
          if (timeCheckIntervalRef.current) {
            clearInterval(timeCheckIntervalRef.current);
          }
        }
      }, 1000);
    } else {
      if (timeCheckIntervalRef.current) {
        clearInterval(timeCheckIntervalRef.current);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl shadow-primary/20">
        <div id="youtube-player" className="w-full h-full"></div>
      </div>
      
      <div className="h-20 flex items-center justify-center">
        <div className={cn(
            'transition-all duration-500 ease-in-out',
            showButton ? 'opacity-100 visible' : 'opacity-0 invisible'
          )}>
            <Button asChild size="lg" className="w-full md:w-auto text-lg md:text-xl font-bold py-8 px-10 hover:scale-105 transition-transform duration-300 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-hidden={!showButton}
                tabIndex={showButton ? 0 : -1}
              >
                Quero Acessar o Indicador Agora
              </a>
            </Button>
        </div>
      </div>
    </div>
  );
}
