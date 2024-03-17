"use client";

import { useCallback, useRef, useEffect, useState } from "react";
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
  const imageRef = useRef(new Image());

  const loadModels = useCallback(() => {
    return Promise.all([
      faceapi.loadTinyFaceDetectorModel("/models"),
      faceapi.loadFaceLandmarkTinyModel("/models"),
    ]);
  }, []);

  useEffect(() => {
    loadModels().then(() => {
      const image = imageRef.current;
      image.src = `/noggles/${selectedNoggle}.png`;
      image.onload = () => setImageLoaded(true);
    });
  }, [loadModels, selectedNoggle]);

  useEffect(() => {
    if (!imageLoaded) return;

    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    const onPlay = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        ctx.clearRect(0, 0, displaySize.width, displaySize.height);

        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks(true);

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize,
        );

        const image = imageRef.current;
        resizedDetections.forEach((detection) => {
          const { landmarks } = detection;
          const nose = landmarks.getNose();
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          const noseCenter = nose[3];
          const leftEyeCenter = leftEye[3];
          const rightEyeCenter = rightEye[3];
          const eyeDistance = Math.abs(leftEyeCenter.x - rightEyeCenter.x);
          const noggleWidth = eyeDistance * 2;
          const noggleHeight = noggleWidth * 0.6;
          const noggleX = noseCenter.x - noggleWidth / 2;
          const noggleY = noseCenter.y - noggleHeight / 1.1;

          ctx.drawImage(image, noggleX, noggleY, noggleWidth, noggleHeight);
        });

        requestAnimationFrame(onPlay);
      }
    };

    requestAnimationFrame(onPlay);
  }, [imageLoaded, selectedNoggle]);

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
          width={500}
          height={500}
          style={{
            zIndex: 100,
            position: "absolute",
            left: 0,
            top: 0,
          }}
        />
        <Webcam
          videoConstraints={videoConstraints}
          ref={webcamRef}
          width={500}
          height={500}
          style={{ position: "absolute" }}
        />
      </div>
    </>
  );
}
