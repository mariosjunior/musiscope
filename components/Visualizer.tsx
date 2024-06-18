import dynamic from "next/dynamic";
import React from "react";

const VisualizerClient = dynamic(() => import("./VisualizerClient"), {
  ssr: false,
});

interface VisualizerProps {
  audioElement: HTMLAudioElement | null;
}

const Visualizer: React.FC<VisualizerProps> = ({ audioElement }) => {
  return <VisualizerClient audioElement={audioElement} />;
};

export default Visualizer;
