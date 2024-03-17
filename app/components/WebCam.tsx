"use client";

import { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

export default function WebCamComponent() {
  const webcamRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function loadModels() {
    return Promise.all([
      faceapi.loadTinyFaceDetectorModel("/models"),
      faceapi.loadFaceLandmarkTinyModel("/models"),
    ]);
  }

  useEffect(() => {
    loadModels();
  }, []);

  const handleVideoOnPlay = () => {
    console.log("video plays");
    const video = webcamRef.current.video;
    const canvas = canvasRef.current;

    console.log("gets here");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("Canvas context not found!");
      return;
    }

    const displaySize = {
      width: 1280,
      height: 720,
    };

    ctx.canvas.width = displaySize.width;
    ctx.canvas.height = displaySize.height;

    faceapi.matchDimensions(ctx, displaySize);

    const intervalId = setInterval(async () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true);

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      faceapi.draw.drawDetections(ctx, resizedDetections);
      faceapi.draw.drawFaceLandmarks(ctx, resizedDetections);

      // Additional code to overlay glasses goes here
    }, 100);

    return () => {
      clearInterval(intervalId);
      video.removeEventListener("loadeddata", handleVideoOnPlay);
    };
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  return (
    <>
      <div style={{ width: "1280px", height: "720px", position: "relative" }}>
        <canvas
          width={460}
          height={500}
          ref={canvasRef}
          style={{
            zIndex: 100,
            position: "absolute",
            left: 0,
            top: 0,
          }}
        />
        <Webcam
          videoConstraints={videoConstraints}
          onUserMedia={handleVideoOnPlay}
          ref={webcamRef}
          style={{ position: "absolute" }}
        />
      </div>
    </>
  );
}
