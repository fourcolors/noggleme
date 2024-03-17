"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

interface WebCamComponentProps {
  selectedNoggle: number;
}

export default function WebCamComponent({
  selectedNoggle,
}: WebCamComponentProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const imageRef = useRef(new Image());

  const loadModels = useCallback(async () => {
    await faceapi.nets.tinyFaceDetector.load("/models");
    await faceapi.nets.faceLandmark68TinyNet.load("/models");
    setModelsLoaded(true);
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  useEffect(() => {
    const image = imageRef.current;
    image.src = `/noggles/${selectedNoggle}.png`;
    image.onload = () => setImageLoaded(true);
  }, [selectedNoggle]);

  useEffect(() => {
    if (!imageLoaded || !modelsLoaded) return;

    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onPlay = async () => {
      if (webcamRef.current && webcamRef.current.video) {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks(true);

        const resizedDetections = faceapi.resizeResults(detections, {
          width: video.videoWidth,
          height: video.videoHeight,
        });

        ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);

        const image = imageRef.current;
        resizedDetections.forEach((detection) => {
          const nose = detection.landmarks.getNose();
          const topOfNose = nose[0];
          const imageX = topOfNose.x - image.width / 2 - 25;
          const imageY = topOfNose.y - image.height / 2 + 10;

          ctx.drawImage(image, imageX, imageY, image.width, image.height);
        });

        requestAnimationFrame(onPlay);
      }
    };

    onPlay();
  }, [imageLoaded, modelsLoaded, selectedNoggle]);

  const videoConstraints = {
    width: 500,
    height: 500,
    facingMode: "user",
  };

  return (
    <>
      <div style={{ width: "500px", height: "500px", position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{ zIndex: 100, position: "absolute", left: 0, top: 0 }}
          width={500}
          height={500}
        />
        <Webcam
          videoConstraints={videoConstraints}
          ref={webcamRef}
          style={{ position: "absolute" }}
        />
      </div>
    </>
  );
}
