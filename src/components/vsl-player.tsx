
"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

// Declare YT for TypeScript
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const VSL_CTA_TIMESTAMP = 167; // 2 minutes 47 seconds
const VIDEO_ID = "ewlGNXdH7oM";

const calculateNonLinearProgress = (currentTime: number, duration: number): number => {
    if (!duration || currentTime <= 0) return 0;
    const videoPercentage = (currentTime / duration) * 100;

    if (videoPercentage <= 10) {
        return videoPercentage * 6;
    }
    if (videoPercentage <= 70) {
        return 60 + ((videoPercentage - 10) / 60) * 20;
    }
    if (videoPercentage <= 80) {
        return 80 + (videoPercentage - 70);
    }
    return Math.min(100, 90 + ((videoPercentage - 80) / 20) * 10);
};

export default function VslPlayer({ onVideoEnd }: { onVideoEnd: () => void }) {
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCta, setShowCta] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [counter, setCounter] = useState<{ value: string; color: string } | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmuteButton, setShowUnmuteButton] = useState(true);

  useEffect(() => {
    const videoEndedStored = localStorage.getItem('vsl_videoEnded') === 'true';

    const setupCounter = () => {
      setVideoEnded(true);
      onVideoEnd();
      setShowCta(true);
      const endTime = parseInt(localStorage.getItem('vsl_videoEndTime') || '0', 10);
      const now = Date.now();
      const elapsedSeconds = (now - endTime) / 1000;

      if (elapsedSeconds >= 42) {
          setCounter({ value: '9', color: 'text-red-600' });
      } else if (elapsedSeconds >= 12) {
          setCounter({ value: '10', color: 'text-red-600' });
          setTimeout(() => {
              setCounter({ value: '9', color: 'text-red-600' });
          }, (42 - elapsedSeconds) * 1000);
      } else {
          setCounter({ value: '11', color: 'text-primary' });
          setTimeout(() => {
              setCounter({ value: '10', color: 'text-red-600' });
              setTimeout(() => {
                  setCounter({ value: '9', color: 'text-red-600' });
              }, 30000);
          }, (12 - elapsedSeconds) * 1000);
      }
    };
    
    if (videoEndedStored) {
      setupCounter();
      return;
    }

    const startProgressInterval = () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          
          localStorage.setItem('vsl_currentTime', currentTime.toString());
          setProgress(calculateNonLinearProgress(currentTime, duration));

          if (currentTime >= VSL_CTA_TIMESTAMP) {
            setShowCta(true);
          }
        }
      }, 500);
    };

    const stopProgressInterval = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
    
    const onPlayerReady = (event: any) => {
      playerRef.current = event.target;
      setPlayerReady(true);
      const storedTime = parseFloat(localStorage.getItem('vsl_currentTime') || '0');
      if (storedTime > 0 && storedTime < playerRef.current.getDuration()) {
          playerRef.current.seekTo(storedTime, true);
      }
      if (storedTime >= VSL_CTA_TIMESTAMP) {
          setShowCta(true);
      }
      playerRef.current.playVideo();
    };
    
    const handleVideoEnd = () => {
        setIsPlaying(false);
        stopProgressInterval();
        localStorage.setItem('vsl_videoEnded', 'true');
        localStorage.setItem('vsl_videoEndTime', Date.now().toString());
        if(playerRef.current?.destroy) playerRef.current.destroy();
        playerRef.current = null;
        setupCounter();
    }

    const onPlayerStateChange = (event: any) => {
      if (event.data === window.YT.PlayerState.PLAYING) {
        setIsPlaying(true);
        startProgressInterval();
      } else if (event.data === window.YT.PlayerState.PAUSED) {
        setIsPlaying(false);
        stopProgressInterval();
      } else if (event.data === window.YT.PlayerState.ENDED) {
        handleVideoEnd();
      }
    };

    const createPlayer = () => {
       if (document.getElementById('youtube-player') && !playerRef.current) {
         playerRef.current = new window.YT.Player('youtube-player', {
             videoId: VIDEO_ID,
             playerVars: {
               autoplay: 1, controls: 0, showinfo: 0, modestbranding: 1,
               rel: 0, iv_load_policy: 3, fs: 0, disablekb: 1, mute: 1,
             },
             events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange },
           });
       }
    };
    
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
        window.onYouTubeIframeAPIReady = createPlayer;
    } else {
        createPlayer();
    }

    return () => {
        stopProgressInterval();
    };
  }, [onVideoEnd]);

  const toggleMute = () => {
    if (!playerRef.current || !playerReady || videoEnded) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleInitialPlay = () => {
    if (!playerRef.current || !playerReady || videoEnded) return;
    
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
      playerRef.current.seekTo(0, true);
    }
    
    if (!isPlaying) {
      playerRef.current.playVideo();
    }
  };


  if (videoEnded && counter) {
    return (
        <div className="w-full">
            <div className="flex flex-col items-center justify-center text-center p-4 animate-pulse">
                <p className="text-xl md:text-2xl font-bold uppercase text-white">Faltam apenas</p>
                <div className={cn("text-7xl md:text-8xl font-bold my-2", counter.color)}>{counter.value}</div>
                <p className="text-xl md:text-2xl font-bold uppercase text-white">Licenças</p>
            </div>
            {showCta && (
              <div className="mt-8">
                  <a href="https://pay.kiwify.com.br/N2HRXHr" target="_blank" rel="noopener noreferrer" className="block">
                    <button 
                      className="w-full max-w-md mx-auto animate-pulse rounded-lg bg-yellow-400 px-6 py-4 text-lg font-bold text-black shadow-lg transition hover:scale-105 sm:px-8 sm:text-xl md:text-2xl"
                    >
                        QUERO ACESSAR AGORA
                    </button>
                  </a>
              </div>
            )}
        </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative aspect-video w-full max-w-4xl mx-auto overflow-hidden rounded-lg shadow-2xl bg-black">
        <div id="youtube-player" className="w-full h-full" />
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={handleInitialPlay}
        >
          {isMuted && playerReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 transition-opacity duration-300">
              <div className="text-white text-center p-4 rounded-lg">
                <p className="text-2xl font-bold mb-4">CLIQUE PARA ATIVAR O SOM</p>
                <VolumeX className="h-16 w-16 text-white drop-shadow-lg md:h-20 md:w-20 mx-auto" fill="white" />
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-500/50">
            <div className="h-full bg-primary transition-all duration-500 ease-linear" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {showCta && (
        <div className="mt-8">
            <a href="https://pay.kiwify.com.br/N2HRXHr" target="_blank" rel="noopener noreferrer" className="block">
              <button 
                className="w-full max-w-md mx-auto animate-pulse rounded-lg bg-yellow-400 px-6 py-4 text-lg font-bold text-black shadow-lg transition hover:scale-105 sm:px-8 sm:text-xl md:text-2xl"
              >
                  QUERO ACESSAR AGORA
              </button>
            </a>
        </div>
      )}
    </div>
  );
}
