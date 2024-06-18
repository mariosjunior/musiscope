"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface VisualizerProps {
  audioElement: HTMLAudioElement | null;
}

const Visualizer: React.FC<VisualizerProps> = ({ audioElement }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!audioElement) return;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audioElement);
    const analyser = audioCtx.createAnalyser();

    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Configurar a cena Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    if (containerRef.current) {
      containerRef.current.innerHTML = ""; // Limpar conteúdo anterior
      containerRef.current.appendChild(renderer.domElement);
    }

    const bars: THREE.Mesh[] = [];
    const barWidth = 0.1;
    const barGap = 0.05;

    for (let i = 0; i < bufferLength; i++) {
      const geometry = new THREE.BoxGeometry(barWidth, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.x =
        i * (barWidth + barGap) - (bufferLength * (barWidth + barGap)) / 2;
      scene.add(bar);
      bars.push(bar);
    }

    camera.position.z = 30;

    const animate = () => {
      requestAnimationFrame(animate);

      analyser.getByteFrequencyData(dataArray);

      bars.forEach((bar, index) => {
        const scale = dataArray[index] / 128;
        bar.scale.y = scale;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      audioCtx.close();
    };
  }, [audioElement]);

  return <div ref={containerRef} className="w-full h-full"></div>;
};

export default Visualizer;
