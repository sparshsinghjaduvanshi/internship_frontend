"use client";

import { useRef, useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
  onNextVideo: () => void;
}

export default function VideoPlayer({ video, onNextVideo }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const router = useRouter();
  // const [tapCount, setTapCount] = useState(0);
  // const [tapZone, setTapZone] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  const tapCounter = useRef(0);
  const watchLimits: any = {
    free: 300,
    bronze: 420,
    silver: 400,
    gold: Infinity,
  };

  const currentPlan = user?.plan || "free";
  const allowedTime = watchLimits[currentPlan];


  // useEffect(() => {
  //   const videoElement = videoRef.current;
  //   if (!videoElement) return;
  //   const handleTimeUpdate = () => {
  //     setCurrentTime(
  //       videoElement.currentTime
  //     );

  //     setDuration(
  //       videoElement.duration || 0
  //     );
  //     if (
  //       videoElement.currentTime >=
  //       allowedTime
  //     ) {
  //       videoElement.pause();
  //       alert(
  //         `Your ${currentPlan} plan watch limit has been reached. Upgrade your plan to continue watching.`
  //       );
  //     }
  //   };

  //   videoElement.addEventListener(
  //     "timeupdate",
  //     handleTimeUpdate
  //   );
  //   videoElement.addEventListener(
  //     "play",
  //     () => setIsPlaying(true)
  //   );

  //   videoElement.addEventListener(
  //     "pause",
  //     () => setIsPlaying(false)
  //   );
  //   return () => {
  //     videoElement.removeEventListener(
  //       "timeupdate",
  //       handleTimeUpdate
  //     );
  //   };

  // }, [allowedTime, currentPlan]);

  // useEffect(() => {
  //   setCurrentTime(0);
  //   setDuration(0);
  //   setIsPlaying(false);

  //   const videoElement =
  //     videoRef.current;
  //   if (!videoElement) return;
  //   const handleLoadedMetadata =
  //     () => {
  //       setDuration(
  //         videoElement.duration || 0
  //       );
  //     };
  //   videoElement.addEventListener(
  //     "loadedmetadata",
  //     handleLoadedMetadata
  //   );

  //   return () => {
  //     videoElement.removeEventListener(
  //       "loadedmetadata",
  //       handleLoadedMetadata
  //     );
  //   };

  // }, [video._id]);

  const togglePlayPause = () => {

    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    if (videoElement.paused) {

      videoElement.play();

      setIsPlaying(true);

    } else {

      videoElement.pause();

      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (value: number) => {
    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    videoElement.volume = value;

    setVolume(value);

    if (value === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };
  const toggleMute = () => {
    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    if (isMuted) {
      videoElement.muted = false;
      setIsMuted(false);
    } else {
      videoElement.muted = true;
      setIsMuted(true);
    }
  };


  const handleTripleTap = (zone: string) => {
    tapCounter.current += 1;

    if (tapTimeout.current) {
      clearTimeout(
        tapTimeout.current
      );
    }
    tapTimeout.current =
      setTimeout(() => {

        // TRIPLE LEFT
        if (
          tapCounter.current === 3 &&
          zone === "left"
        ) {
          const commentsSection =
            document.getElementById(
              "comments-section"
            );
          commentsSection
            ?.scrollIntoView({
              behavior: "smooth",
            });
        }
        // TRIPLE CENTER


        // TRIPLE RIGHT
        if (
          tapCounter.current === 3 &&
          zone === "right"
        ) {
          if (
            document.fullscreenElement
          ) {
            document.exitFullscreen();
          }
          router.push("/");
        }
        tapCounter.current = 0;

      }, 400);
  };
  return (
    <div ref={playerRef} className="relative aspect-video fullscreen:w-screen fullscreen:h-screen bg-black  rounded-lg  overflow-hidden  ">
      <video
        key={video._id}
        ref={videoRef}
        autoPlay
        className="w-full h-full"

        onTimeUpdate={() => {
          const videoElement =
            videoRef.current;
          if (!videoElement) return;
          setCurrentTime(
            videoElement.currentTime
          );
          if (
            videoElement.currentTime >=
            allowedTime
          ) {
            videoElement.pause();
            alert(
              `Your ${currentPlan} plan watch limit has been reached. Upgrade your plan to continue watching.`
            );
          }
        }}

        onLoadedMetadata={() => {
          const videoElement =
            videoRef.current;

          if (!videoElement) return;
          setDuration(
            videoElement.duration || 0
          );
          setCurrentTime(0);
        }}
        onPlay={() =>
          setIsPlaying(true)
        }
        onPause={() =>
          setIsPlaying(false)
        }
      >
        <source
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video?.filepath}`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 flex z-10 pb-24 pointer-events-none">

        {/* LEFT */}
        <div className="w-1/3 h-full cursor-pointer pointer-events-auto"

          onClick={(e) => {
            e.stopPropagation();
            handleTripleTap("left");
          }}

          onDoubleClick={(e) => {

            e.preventDefault();

            const videoElement =
              videoRef.current;

            if (!videoElement) return;

            videoElement.currentTime =
              Math.max(
                0,
                videoElement.currentTime - 10
              );
          }}
        />

        {/* CENTER */}
        <div className="w-1/3 h-full cursor-pointer pointer-events-auto"

          onClick={() => {

            tapCounter.current = tapCounter.current + 1;

            if (tapTimeout.current) {
              clearTimeout(
                tapTimeout.current
              );
            }

            tapTimeout.current =
              setTimeout(() => {
                // SINGLE TAP
                if (
                  tapCounter.current === 1
                ) {
                  togglePlayPause();
                }

                // TRIPLE TAP
                if (
                  tapCounter.current === 3
                ) {
                  onNextVideo();
                }
                tapCounter.current = 0;

              }, 400);
          }}
        />

        {/* RIGHT */}
        <div className="w-1/3 h-full cursor-pointer pointer-events-auto"

          onClick={(e) => {
            e.stopPropagation();
            handleTripleTap("right");
          }}

          onDoubleClick={(e) => {

            e.preventDefault();

            const videoElement =
              videoRef.current;

            if (!videoElement) return;

            videoElement.currentTime =
              Math.min(
                videoElement.duration,
                videoElement.currentTime + 10
              );
          }}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 z-20 flex flex-col">

        {/* PROGRESS BAR */}
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}

          onInput={(e: any) => {

            const videoElement =
              videoRef.current;

            if (!videoElement) return;

            const newTime =
              Number(e.target.value);

            videoElement.currentTime =
              newTime;

            setCurrentTime(newTime);
          }}

          className="w-full mb-2"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between text-white gap-2">

          {/* LEFT */}
          <div className="flex flex-wrap items-center gap-3">

            {/* PLAY/PAUSE */}
            <button onClick={togglePlayPause}>

              {isPlaying ? (
                <Pause size={22} />
              ) : (
                <Play size={22} />
              )}

            </button>

            {/* VOLUME */}
            <div className="flex items-center gap-2">

              <button onClick={toggleMute}>

                {isMuted ? (
                  <VolumeX size={20} />
                ) : (
                  <Volume2 size={20} />
                )}

              </button>

              <input type="range" min={0} max={1} step={0.1} value={isMuted ? 0 : volume}
                onChange={(e) =>
                  handleVolumeChange(
                    Number(e.target.value)
                  )
                }
                className="w-20"
              />
            </div>

            {/* TIMER */}
            <span className="text-sm">

              {Math.floor(currentTime / 60)}:
              {String(
                Math.floor(currentTime % 60)
              ).padStart(2, "0")}

              {" / "}

              {Math.floor(duration / 60)}:
              {String(
                Math.floor(duration % 60)
              ).padStart(2, "0")}

            </span>
          </div>

          {/* RIGHT */}
          <button
            onClick={() => {

              const videoElement =
                videoRef.current;

              if (!videoElement) return;

              if (
                document.fullscreenElement
              ) {

                document.exitFullscreen();

              } else {

                playerRef.current
                  ?.requestFullscreen();
              }
            }}
          >
            <Maximize size={20} />
          </button>

        </div>
      </div>
    </div>

  );
}
