"use client";

import React, { useState, useEffect, useRef } from "react";
import Visualizer from "./Visualizer";

const Home: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchAudioFiles = async () => {
      try {
        const response = await fetch("/api/audio");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const files = await response.json();
        console.log("Fetched audio files:", files);
        setAudioFiles(files);
      } catch (error) {
        console.error("Failed to fetch audio files:", error);
      }
    };

    fetchAudioFiles();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    const url = event.target.value;
    setAudioUrl(url);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <select
        onChange={handleInputChange}
        className="p-2 mb-4 text-black rounded"
      >
        <option value="">Select an audio file</option>
        {audioFiles.map((file, index) => (
          <option key={index} value={file}>
            {file.split("/").pop()}
          </option>
        ))}
      </select>
      <div className="flex justify-center mt-4">
        <button
          onClick={handlePlay}
          className="px-4 py-2 mx-2 text-black bg-white rounded"
        >
          Play
        </button>
        <button
          onClick={handlePause}
          className="px-4 py-2 mx-2 text-black bg-white rounded"
        >
          Pause
        </button>
        <button
          onClick={handleStop}
          className="px-4 py-2 mx-2 text-black bg-white rounded"
        >
          Stop
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          onChange={handleVolumeChange}
          className="mx-2"
        />
      </div>
      <div className="w-full h-96">
        {audioUrl && (
          <>
            <audio ref={audioRef} src={audioUrl} />
            <Visualizer audioElement={audioRef.current} />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
