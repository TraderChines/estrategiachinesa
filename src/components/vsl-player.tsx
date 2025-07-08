"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Play, Undo2 } from 'lucide-react';

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
  const [videoEnded, setVideoEnded] = useState(false);
  const timeCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const enterFullScreen = () => {
    const playerElement = playerContainerRef.current;
    if (playerElement) {
      if (playerElement.requestFullscreen) {
        playerElement.requestFullscreen();
      } else if ((playerElement as any).mozRequestFullScreen) {
        (playerElement as any).mozRequestFullScreen();
      } else if ((playerElement as any).webkitRequestFullscreen) {
        (playerElement as any).webkitRequestFullscreen();
      } else if ((playerElement as any).msRequestFullscreen) {
        (playerElement as any).msRequestFullscreen();
      }
    }
  };

  const exitFullScreen = () => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  const handleTogglePlay = () => {
    if (videoEnded) return;

    if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
      const playerState = playerRef.current.getPlayerState();
      if (playerState === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
        enterFullScreen();
      }
    }
  };

  const handleRewind = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(0, currentTime - 10), true);
    }
  };

  useEffect(() => {
    const buttonAppearTime = 167; // 2 minutes and 47 seconds
    const exitFullScreenTime = 9; // 9 seconds
    
    const checkTime = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function' && typeof playerRef.current.getDuration === 'function') {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        
        if (duration > 0) {
          let calculatedProgress = 0;
          const videoProgress = currentTime / duration;
          
          if (videoProgress <= 0.10) {
            calculatedProgress = (videoProgress / 0.10) * 60;
          } else if (videoProgress <= 0.70) { 
            const timeInStage = videoProgress - 0.10;
            const progressInStage = (timeInStage / 0.60) * 20;
            calculatedProgress = 60 + progressInStage;
          } else if (videoProgress <= 0.80) {
            const timeInStage = videoProgress - 0.70;
            const progressInStage = (timeInStage / 0.10) * 10;
            calculatedProgress = 80 + progressInStage;
          } else { 
            const timeInStage = videoProgress - 0.80;
            const progressInStage = (timeInStage / 0.20) * 10;
            calculatedProgress = 90 + progressInStage;
          }
    
          setProgress(Math.min(calculatedProgress, 100));
        }

        if (!showButton && currentTime >= buttonAppearTime) {
          setShowButton(true);
        }

        if (currentTime >= exitFullScreenTime) {
          exitFullScreen();
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
        setProgress(0);
        setVideoEnded(true);
        setShowButton(true);
        if (timeCheckInterval.current) {
          clearInterval(timeCheckInterval.current);
        }
        exitFullScreen();
      }
    };
    
    const onPlayerReady = (event: any) => {
      // Player is ready
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
          loop: 0,
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
  }, [videoId, showButton, videoEnded]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div ref={playerContainerRef} className="relative aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl shadow-primary/20">
        <div id="youtube-player" className="w-full h-full"></div>
        <div 
          className={`absolute inset-0 w-full h-full flex items-center justify-center group ${videoEnded ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={handleTogglePlay}
        >
          {(!isPlaying || videoEnded) && (
            <div className={`bg-black/50 p-4 rounded-full transition-all duration-300 ${!videoEnded && 'group-hover:bg-black/70'}`}>
              <Play className="text-white h-8 w-8 md:h-12 md:w-12 fill-white" />
            </div>
          )}
        </div>
        
        {isPlaying && !videoEnded && (
          <Button
            onClick={handleRewind}
            variant="ghost"
            size="icon"
            className="absolute bottom-4 left-4 text-white bg-black/30 hover:bg-black/50 h-10 w-10 p-2 z-10"
          >
            <Undo2 className="h-6 w-6" />
          </Button>
        )}

        <Progress value={progress} className="absolute bottom-0 w-full h-2 rounded-none z-0" />
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
