
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const VSL_COOKIE_KEY = 'vsl_video_end_timestamp';
const COOKIE_DURATION_DAYS = 7;

const FAKE_BUYER_NAMES = [
  'Lucas', 'Ana', 'Bruno', 'Carla', 'Daniel', 'Eduarda', 'Felipe', 'Gabriela',
  'Heitor', 'Isabela', 'João', 'Larissa', 'Marcos', 'Natália', 'Otávio', 'Patrícia'
];

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
  const [licenses, setLicenses] = useState<number | null>(null);
  const { toast } = useToast();
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);


  const licenseSchedule = [
    { time: 20 * 1000, count: 9 }, // 20 segundos
    { time: 30 * 1000, count: 8 }, // 30 segundos
    { time: 60 * 60 * 1000, count: 7 }, // 1 hora
    { time: 6 * 60 * 60 * 1000, count: 6 }, // 6 horas
    { time: 12 * 60 * 60 * 1000, count: 5 }, // 12 horas
    { time: 24 * 60 * 60 * 1000, count: 4 }, // 1 dia
    { time: 2 * 24 * 60 * 60 * 1000, count: 3 }, // 2 dias
    { time: 6 * 24 * 60 * 60 * 1000, count: 2 }, // 6 dias
  ];

  const showSocialProof = useCallback(() => {
    const randomName = FAKE_BUYER_NAMES[Math.floor(Math.random() * FAKE_BUYER_NAMES.length)];
    toast({
      description: `${randomName} acabou de garantir o acesso à Estratégia Chinesa!`,
      duration: 5000,
    });
  }, [toast]);

  const updateLicenses = useCallback((endTime: number) => {
    const now = Date.now();
    const elapsedTime = now - endTime;

    let currentLicenses = 10;
    for (const schedule of licenseSchedule) {
      if (elapsedTime >= schedule.time) {
        currentLicenses = schedule.count;
      } else {
        break;
      }
    }
    setLicenses(currentLicenses);
    
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    let lastCount = 10;
    licenseSchedule.forEach(schedule => {
      if (now < endTime + schedule.time) {
        const timeout = setTimeout(() => {
          setLicenses(schedule.count);
          if (schedule.count < lastCount) {
             showSocialProof();
          }
          lastCount = schedule.count;
        }, (endTime + schedule.time) - now);
        timeoutsRef.current.push(timeout);
      }
    });
  }, [licenseSchedule, showSocialProof]);


  useEffect(() => {
    const cookieValue = localStorage.getItem(VSL_COOKIE_KEY);
    if (cookieValue) {
      const { timestamp } = JSON.parse(cookieValue);
      const now = Date.now();

      if (now - timestamp > COOKIE_DURATION_DAYS * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(VSL_COOKIE_KEY);
      } else {
        setVideoEnded(true);
        setShowButton(true);
        updateLicenses(timestamp);
      }
    }
  }, [updateLicenses]);

  const handleTogglePlay = () => {
    if (videoEnded) return;

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
    const buttonAppearTime = 167; // 2 minutes and 47 seconds

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

        const endTime = Date.now();
        const cookieData = JSON.stringify({ timestamp: endTime });
        localStorage.setItem(VSL_COOKIE_KEY, cookieData);
        updateLicenses(endTime);
      }
    };
    
    const onPlayerReady = (event: any) => {
        event.target.playVideo();
    };

    const onYouTubeIframeAPIReady = () => {
      if (playerApiReady.current || videoEnded) return;
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
          loop: 0,
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    };
    
    const loadYouTubeAPI = () => {
      if (videoEnded) return;
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
      timeoutsRef.current.forEach(clearTimeout);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, [videoId, videoEnded, updateLicenses]);

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
          {videoEnded && licenses !== null && (
            <div className="text-center animate-in fade-in duration-1000">
              <p className="text-2xl md:text-3xl font-bold tracking-wide uppercase">Restam</p>
              <p className={cn(
                  "text-6xl md:text-8xl font-black my-1 transition-all duration-300",
                   "text-red-500 [text-shadow:0_0_8px_rgba(239,68,68,0.7)]"
                )}>
                  {licenses}
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
                <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </a>
          </div>
        </div>
    </div>
  );
}

    