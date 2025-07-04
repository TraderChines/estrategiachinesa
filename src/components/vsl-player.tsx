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
  const [isPlaying, setIsPlaying] = useState(true);
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
        const buttonAppearTime = 10;

        if (duration > 0) {
          let calculatedProgress = 0;
          const videoProgress = currentTime / duration;

          if (videoProgress <= 0.40) {
            calculatedProgress = (videoProgress / 0.40) * 60;
          } else if (videoProgress <= 0.50) {
            const timeInStage = videoProgress - 0.40;
            const stageDuration = 0.10;
            calculatedProgress = 60 + (timeInStage / stageDuration) * 5;
          } else if (videoProgress <= 0.85) {
            const timeInStage = videoProgress - 0.50;
            const stageDuration = 0.35;
            calculatedProgress = 65 + (timeInStage / stageDuration) * 30;
          } else {
            const timeInStage = videoProgress - 0.85;
            const stageDuration = 0.15;
            calculatedProgress = 95 + (timeInStage / stageDuration) * 5;
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
      } else {
        setIsPlaying(false);
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
          loop: 1,
          playlist: videoId
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
      <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl shadow-primary/20">
        <div id="youtube-player" className="w-full h-full"></div>
        <div 
          className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer group"
          onClick={handleTogglePlay}
        >
          {!isPlaying && (
            <div className="bg-black/50 p-4 rounded-full transition-all duration-300 group-hover:bg-black/70">
              <Play className="text-white h-12 w-12 fill-white" />
            </div>
          )}
        </div>
      </div>
      <Progress value={progress} className="w-full h-2" />
      {showButton && (
        <a href="https://pay.kiwify.com.br/N2HRXHr" className="block">
          <Button size="lg" className="w-full text-xl font-bold py-8 animate-pulse bg-yellow-400 hover:bg-yellow-500 text-black">
            QUERO ACESSAR A ESTRATÉGIA CHINESA
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </a>
      )}
    </div>
  );
}
