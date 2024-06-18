"use client";

import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faStop,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import Visualizer from "./Visualizer";

const Home: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchAudioFiles = async () => {
      try {
        const response = await fetch("/api/audio");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const files = await response.json();
        setAudioFiles(files);
      } catch (error) {
        console.error("Failed to fetch audio files:", error);
      }
    };

    fetchAudioFiles();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
    }
  }, [audioUrl]);

  const handleButtonClick = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setAudioUrl(url);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 0);
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.volume = parseFloat(event.target.value);
    }
  };

  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = parseFloat(event.target.value);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white relative">
      <div className="w-full h-full">
        {audioUrl && (
          <>
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              autoPlay
            />
            <Visualizer audioElement={audioRef.current} />
          </>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-10 backdrop-blur-lg p-4 flex flex-col items-center space-y-4">
        <div className="flex justify-center items-center flex-wrap mb-4">
          {audioFiles.map((file, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(file)}
              className="bg-transparent border-2 border-white text-white py-2 px-4 m-2 rounded-full hover:shadow-lg hover:shadow-[#64ffda] transition-shadow"
            >
              {file.split("/").pop()?.replace(".mp3", "")}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center space-x-4 w-full max-w-3xl">
          <button onClick={handlePlay} className="text-white">
            <FontAwesomeIcon icon={faPlay} size="2x" />
          </button>
          <button onClick={handlePause} className="text-white">
            <FontAwesomeIcon icon={faPause} size="2x" />
          </button>
          <button onClick={handleStop} className="text-white">
            <FontAwesomeIcon icon={faStop} size="2x" />
          </button>

          <div className="flex items-center w-full mx-4">
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full"
            />
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={faVolumeUp} className="text-white mr-2" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={audioRef.current ? audioRef.current.volume : 0.1}
              onChange={handleVolumeChange}
              className="mx-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
