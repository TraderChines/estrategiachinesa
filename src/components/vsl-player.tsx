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
          const midpointTime = duration / 2;
          const midpointProgress = 90;
          let calculatedProgress = 0;

          if (currentTime <= midpointTime) {
            // Phase 1: Rapidly get to 90% progress by the time the video is halfway through.
            const phase1Duration = midpointTime;
            if (phase1Duration > 0) {
                calculatedProgress = (currentTime / phase1Duration) * midpointProgress;
            }
          } else {
            // Phase 2: Cover the remaining 10% of progress in the second half of the video.
            const timeInPhase2 = currentTime - midpointTime;
            const phase2Duration = duration - midpointTime;
            const phase2ProgressSpan = 100 - midpointProgress;
            if (phase2Duration > 0) {
                calculatedProgress = midpointProgress + (timeInPhase2 / phase2Duration) * phase2ProgressSpan;
            } else {
                calculatedProgress = 100;
            }
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
