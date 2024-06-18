"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GUI } from "dat.gui";
// @ts-ignore: Ignoring missing type declarations for these modules
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
// @ts-ignore: Ignoring missing type declarations for these modules
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
// @ts-ignore: Ignoring missing type declarations for these modules
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
// @ts-ignore: Ignoring missing type declarations for these modules
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { vertexShader, fragmentShader } from "../app/shaders";
import useDeviceSize from "../hooks/useDeviceSize";

interface VisualizerProps {
  audioElement: HTMLAudioElement | null;
}

const VisualizerClient: React.FC<VisualizerProps> = ({ audioElement }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, height] = useDeviceSize();

  useEffect(() => {
    if (!audioElement || width === 0 || height === 0) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(renderer.domElement);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    const params = {
      red: 100 / 255,
      green: 255 / 255,
      blue: 218 / 255,
      threshold: 0.5,
      strength: 0.5,
      radius: 0.8,
    };

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      params.strength,
      params.radius,
      params.threshold
    );

    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    const outputPass = new OutputPass();
    bloomComposer.addPass(outputPass);

    camera.position.set(0, -2, 20);
    camera.lookAt(10, 0, 0);

    const uniforms = {
      u_time: { type: "f", value: 0.0 },
      u_frequency: { type: "f", value: 0.0 },
      u_red: { type: "f", value: params.red },
      u_green: { type: "f", value: params.green },
      u_blue: { type: "f", value: params.blue },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    const geo = new THREE.IcosahedronGeometry(4, 30);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 2;
    scene.add(mesh);
    mesh.material.wireframe = true;

    const listener = new THREE.AudioListener();
    camera.add(listener);

    const sound = new THREE.Audio(listener);
    sound.setMediaElementSource(audioElement);

    const analyser = new THREE.AudioAnalyser(sound, 32);

    const gui = new GUI();

    const colorsFolder = gui.addFolder("Colors");
    colorsFolder.add(params, "red", 0, 1).onChange((value) => {
      uniforms.u_red.value = Number(value);
    });
    colorsFolder.add(params, "green", 0, 1).onChange((value) => {
      uniforms.u_green.value = Number(value);
    });
    colorsFolder.add(params, "blue", 0, 1).onChange((value) => {
      uniforms.u_blue.value = Number(value);
    });

    const bloomFolder = gui.addFolder("Bloom");
    bloomFolder.add(params, "threshold", 0, 1).onChange((value) => {
      bloomPass.threshold = Number(value);
    });
    bloomFolder.add(params, "strength", 0, 3).onChange((value) => {
      bloomPass.strength = Number(value);
    });
    bloomFolder.add(params, "radius", 0, 1).onChange((value) => {
      bloomPass.radius = Number(value);
    });

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener("mousemove", (e) => {
      const windowHalfX = width / 2;
      const windowHalfY = height / 2;
      mouseX = (e.clientX - windowHalfX) / 100;
      mouseY = (e.clientY - windowHalfY) / 100;
    });

    const clock = new THREE.Clock();

    const animate = () => {
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.5;
      camera.lookAt(scene.position);
      uniforms.u_time.value = clock.getElapsedTime();
      uniforms.u_frequency.value = analyser.getAverageFrequency();
      bloomComposer.render();
      requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener("resize", () => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      bloomComposer.setSize(width, height);
    });

    return () => {
      gui.destroy();
      sound.stop();
      if (mesh) {
        geo.dispose();
        mat.dispose();
        scene.remove(mesh);
      }
      renderer.dispose();
    };
  }, [audioElement, width, height]);

  return <div ref={containerRef} className="w-full h-full"></div>;
};

export default VisualizerClient;
