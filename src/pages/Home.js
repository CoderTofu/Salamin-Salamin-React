import * as faceapi from 'face-api.js';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function Home({setImageData}) {
    const [seconds, setSeconds] = useState(30); // Timer
    const [emotion, setEmotion] = useState(''); // instruction
    const [score, setScore] = useState(''); // scoring

  
    // Video Stuff
    const videoRef = useRef();
    const videoWidth = 915;
    const videoHeight = 540;
    const videoSize = { width: videoWidth, height: videoHeight };
    const videoCanvasRef = useRef(null); // Use useRef for mutable variable
  
    // useEffect(() => {
    //   setImageData([]);
    // }, [setImageData]);

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
    
        document.addEventListener('keydown', handleKey)
        loadModels();
        setImageData([]);
        return () => {
            document.removeEventListener("keydown", handleKey);
        }
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

    const handleKey = (event) => {
        if (event.code === 'Space') takeScreenshot();
    }

    const takeScreenshot = () => {
        const imgCanvas = document.createElement('canvas');
        const ctx = imgCanvas.getContext('2d'); 
        const videoElement = document.getElementById('video');
        
        imgCanvas.width = videoWidth;
        imgCanvas.height = videoHeight;
        
        ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
        const dataURL = imgCanvas.toDataURL('image/jpeg');
    
        // Assuming setImgData is a state setter function for an array state
        setImageData(prevData => [
            ...prevData,
            {
                emotion: emotion, // Assuming emotion is defined somewhere
                URL: dataURL
            }
        ]);
        alert("TAKEN")
    };
    
  
    return (
      <div className="home-app">
  
        <div className='app-header'> {/** Top PART */}
          <div className='timer'>
            {seconds} {/** TBA */}
          </div>
          <div className='instruction'>
            <h2 className='instruction-header'>Copy this emotion</h2>
            <h1 className='emotion'>PLACEHOLDER{emotion}</h1>
            <img className='emoji' src="/emojis/1.png" alt="" />
          </div>
          <div className='points'>
            Points: placeholder
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
            <h1>Salamin</h1>
            <h1>Salamin</h1>
          </div>
          <div className='app-control'>
            <div>
              <h3>Start</h3>
              <button>Space</button>
            </div>
            <div>
                <Link to={`/over`}>TEST</Link>
            </div>
          </div>
        </div>
  
      </div>
    );
}