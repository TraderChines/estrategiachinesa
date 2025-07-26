
"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

type VslPlayerProps = {
  videoId: string;
};

const setCookie = (key: string, value: string, days: number) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const item = {
    value: value,
    expiry: expires.toUTCString(),
  };
  localStorage.setItem(key, JSON.stringify(item));
};

const getCookie = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > new Date(item.expiry).getTime()) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    localStorage.removeItem(key);
    return null;
  }
};

const removeCookie = (key: string) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

export default function VslPlayer({ videoId }: VslPlayerProps) {
  const playerRef = useRef<any>(null);
  const playerApiReady = useRef(false);
  const [showButton, setShowButton] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const timeCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [licensasCount, setLicensasCount] = useState(11);
  const [isCounterRed, setIsCounterRed] = useState(false);

  useEffect(() => {
    // Renew cookie on page load if it exists
    const currentTimeCookie = getCookie('vsl_currentTime');
    if (currentTimeCookie) {
      setCookie('vsl_currentTime', currentTimeCookie, 7);
    }
    const videoEndedCookie = getCookie('vsl_videoEnded');
    if (videoEndedCookie) {
        setCookie('vsl_videoEnded', videoEndedCookie, 7);
    }
    const licensasCountCookie = getCookie('vsl_licensasCount');
    if (licensasCountCookie) {
        setCookie('vsl_licensasCount', licensasCountCookie, 7);
    }


    if (getCookie('vsl_licensasCount') === '9') {
      setVideoEnded(true);
      setShowButton(true);
      setLicensasCount(9);
      setIsCounterRed(true);
      return; 
    }

    if (getCookie('vsl_videoEnded') === 'true') {
      setVideoEnded(true);
      setShowButton(true);
      setLicensasCount(10); 
      setIsCounterRed(true);
      const timer = setTimeout(() => { 
        setLicensasCount(9);
        setCookie('vsl_licensasCount', '9', 7);
      }, 30000);
      return () => clearTimeout(timer); 
    }
  }, []);

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

  useEffect(() => {
    if (videoEnded) return;

    const buttonAppearTime = 167; // 2 minutes and 47 seconds
    const exitFullScreenTime = 166; // 2 minutes and 46 seconds
    
    const checkTime = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function' && typeof playerRef.current.getDuration === 'function') {
        const currentTime = playerRef.current.getCurrentTime();
        setCookie('vsl_currentTime', currentTime.toString(), 7);
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
        setVideoEnded(true);
        setShowButton(true);
        if (timeCheckInterval.current) {
          clearInterval(timeCheckInterval.current);
        }
        exitFullScreen();

        setCookie('vsl_videoEnded', 'true', 7);
        removeCookie('vsl_currentTime');

        setLicensasCount(11);
        setIsCounterRed(false);
        setTimeout(() => {
          setLicensasCount(10);
          setIsCounterRed(true);
        }, 12000);
      }
    };
    
    const onPlayerReady = (event: any) => {
      const savedTime = parseFloat(getCookie('vsl_currentTime') || '0');
      if (savedTime > 0) {
        event.target.seekTo(savedTime, true);
        event.target.playVideo();
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
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, [videoId, videoEnded]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center space-y-6">
      <div 
        ref={playerContainerRef}
        className={cn(
          "relative w-full bg-black rounded-lg overflow-hidden shadow-2xl shadow-primary/20 aspect-video transition-all duration-500 ease-in-out",
          videoEnded && "opacity-0 invisible h-0"
        )}
      >
        <div id="youtube-player" className="w-full h-full"></div>
        <div 
          className={cn("absolute inset-0 w-full h-full flex items-center justify-center group", videoEnded ? 'cursor-not-allowed' : 'cursor-pointer')}
          onClick={handleTogglePlay}
        >
          {(!isPlaying && !videoEnded) && (
            <div className={`bg-black/50 p-4 rounded-full transition-all duration-300 group-hover:bg-black/70`}>
              <Play className="text-white h-8 w-8 md:h-12 md:w-12 fill-white" />
            </div>
          )}
        </div>
        
        <Progress value={progress} className="absolute bottom-0 w-full h-2 rounded-none z-0" />
      </div>
      
      <div className={cn(
          "w-full flex flex-col items-center space-y-4 transition-all duration-1000 ease-in-out",
          !showButton && "opacity-0 invisible h-0",
          showButton && videoEnded && "mt-[-25%]"
        )}>
          {videoEnded && (
            <div className="text-center animate-in fade-in duration-1000">
              <p className="text-2xl md:text-3xl font-bold tracking-wide uppercase">Restam</p>
              <p className={cn(
                  "text-6xl md:text-8xl font-black my-1 transition-all duration-300",
                  isCounterRed ? "text-red-500 [text-shadow:0_0_8px_rgba(239,68,68,0.7)]" : "text-primary"
                )}>
                  {licensasCount}
              </p>
              <p className="text-2xl md:text-3xl font-bold tracking-wide uppercase">Licenças</p>
            </div>
          )}
          <div className="w-full max-w-md">
            <a 
              href="https://pay.kiwify.com.br/N2HRXHr" 
              className="block"
            >
              <Button size="lg" className="w-full text-lg md:text-xl font-bold py-4 md:py-6 h-auto animate-pulse bg-yellow-400 hover:bg-yellow-500 text-black">
                QUERO ACESSAR A ESTRATÉGIA CHINESA
              </Button>
            </a>
          </div>
        </div>
    </div>
  );
}
