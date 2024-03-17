"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import NImage from "next/image";

interface WebCamComponentProps {
  selectedNoggle: number;
}

export default function WebCamComponent({
  selectedNoggle,
}: WebCamComponentProps) {
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
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

  const capture = useCallback(() => {
    const webcamImageSrc = webcamRef.current.getScreenshot();
    if (!webcamImageSrc) return;

    const webcamImage = new Image();
    webcamImage.src = webcamImageSrc;
    webcamImage.onload = () => {
      const canvasElement = canvasRef.current;
      const drawingCanvas = document.createElement("canvas");
      if (!canvasElement) return;

      drawingCanvas.width = webcamImage.width;
      drawingCanvas.height = webcamImage.height;

      const ctx = drawingCanvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(webcamImage, 0, 0, webcamImage.width, webcamImage.height);

      ctx.drawImage(canvasElement, 0, 0, webcamImage.width, webcamImage.height);

      const finalImageSrc = drawingCanvas.toDataURL("image/png");

      setCapturedImages((prev) => [...prev, finalImageSrc]);
    };
  }, [webcamRef, canvasRef]);

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
      <button
        onClick={capture}
        className=" focus:ring-4 focus:ring-gray-300 my-4 rounded-full p-4 shadow-2xl transform active:scale-95 transition duration-150 ease-in-out text-white text-lg font-semibold flex items-center justify-center w-20 h-20 md:w-24 md:h-24"
        aria-label="Capture photo"
      >
        <NImage src="/camera.png" width={48} height={48} alt="camera" />
      </button>

      <div className="flex flex-row mx-4 overflow-x-auto space-x-2">
        {capturedImages.map((image, index) => (
          <div
            key={index}
            className="shrink-0 hover:scale-105 transition-transform duration-200 ease-out"
          >
            <NImage
              src={image}
              alt="captured"
              width={200}
              height={100}
              className="shadow-lg border border-gray-200 rounded-md"
            />
          </div>
        ))}
      </div>
    </>
  );
}
