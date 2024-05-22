import * as faceapi from 'face-api.js';
import './App.css';
import React, { useState, useEffect, useRef } from 'react';

function App() {
  // Video Stuff
  const videoRef = useRef();
  const videoWidth = 915;
  const videoHeight = 540;
  const videoSize = { width: videoWidth, height: videoHeight };
  const videoCanvasRef = useRef(null); // Use useRef for mutable variable

  useEffect(() => {
    // Assign the canvas element to the videoCanvasRef
    videoCanvasRef.current = document.getElementById('video-canvas');

    // Load face-api.js models
    const loadModels = () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
      ]).then(startVideo);
    };

    // Start video streaming
    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error('Error accessing webcam:', err));
    };

    loadModels();
  }, []);

  // To detect emotions
  const handlePlay = (video) => {
    faceapi.matchDimensions(videoCanvasRef.current, videoSize);
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(detections, videoSize);
      const context = videoCanvasRef.current.getContext('2d');
      context.clearRect(0, 0, videoCanvasRef.current.width, videoCanvasRef.current.height);
      faceapi.draw.drawDetections(videoCanvasRef.current, resizedDetections);
      faceapi.draw.drawFaceExpressions(videoCanvasRef.current, resizedDetections);
    }, 100);
  }

  return (
    <div className="app">

      <div className='app-header'> {/** Top PART */}
        <div className='timer'>
          {}
        </div>
        <div className='instruction'>

        </div>
        <div className='points'>

        </div>
      </div>

      <div className='video-frame'> {/** Middle PART */}
        <div className='frame'>
          <canvas id='video-canvas'></canvas>
          <video ref={videoRef} onPlay={() => handlePlay(videoRef.current)} id='video' width={`${videoWidth}px`} height={`${videoHeight}px`} autoPlay muted></video>
        </div>
        <div className='emotion'>You are sad</div>
      </div>

      <div className='app-footer'> {/** Bottom PART */}
        <div className='app-name'>

        </div>
        <div className='app-control'>

        </div>
      </div>

    </div>
  );
}


export default App;
