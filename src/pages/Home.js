import * as faceapi from 'face-api.js';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';


let statusIcons = {
  angry: { emoji: '/emojis/1.png', color: '#b64518' },
  disgusted: { emoji: '/emojis/2.png', color: '#1a8d1a' },
  happy: { emoji: '/emojis/3.png', color: '#148f77' },
  sad: { emoji: '/emojis/4.png', color: '#767e7e' },
  surprised: { emoji: '/emojis/5.png', color: '#1230ce' },
  neutral: { emoji: '/emojis/6.png', color: '#54adad' }
}
let emojis = Object.keys(statusIcons);

const getRandomEmotion = () => {
  let randint = Math.floor(Math.random() * emojis.length)
  let emoji = emojis[randint]
  return emoji;
}

export default function Home({setImageData}) {
    const [seconds, setSeconds] = useState(30); // Timer
    const [score, setScore] = useState(0); // scoring
    const [isStarted, setIsStarted] = useState(false); // checks if game started
    const [emotionToCopy, setEmotionToCopy] = useState(getRandomEmotion()); // instruction
    const [emotion, setEmotion] = useState(''); // detected emotion 

    const emotionToCopyRef = useRef(emotionToCopy);
    const emotionRef = useRef(emotion);

    useEffect(() => {
      emotionToCopyRef.current = emotionToCopy;
    }, [emotionToCopy]);
  
    useEffect(() => {
      emotionRef.current = emotion;
    }, [emotion]);
  

    // Video Stuff
    const videoRef = useRef();
    const videoWidth = 915;
    const videoHeight = 540;
    const videoSize = { width: videoWidth, height: videoHeight };
    const videoCanvasRef = useRef(null); // Use useRef for mutable variable

    const navigate = useNavigate();

    // timer
    useEffect(() => {
      if(!isStarted){
          return;
      }
      if(seconds === -1){
          navigate('/over', { state: { score: score } })
      }
      else{
          setTimeout(() => {
          setSeconds((seconds) => seconds - 1);
          }, 1000);
      }
    }, [isStarted, seconds]);
  
    
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
        if(detections.length === 0){
          setEmotion("neutral")
          return;
        }
        
        const resizedDetections = faceapi.resizeResults(detections, videoSize);
        const maxExpression = Object.entries(resizedDetections[0].expressions).reduce((max, [expression, confidence]) => {
          return confidence > max.confidence ? { expression, confidence } : max;
        }, { expression: null, confidence: 0 });
        
        setEmotion(maxExpression.expression);
        
        const context = videoCanvasRef.current.getContext('2d');
        context.clearRect(0, 0, videoCanvasRef.current.width, videoCanvasRef.current.height);
        faceapi.draw.drawDetections(videoCanvasRef.current, resizedDetections);
        faceapi.draw.drawFaceExpressions(videoCanvasRef.current, resizedDetections);
      }, 100);
    }

    const handleKey = (event) => {
        if (event.code === 'Space') {
          if(!isStarted) setIsStarted(true);
          if(emotionToCopyRef.current === emotionRef.current) setScore((score) => score + 1)
          takeScreenshot();
          setEmotionToCopy(getRandomEmotion());
        }
        if(event.code === 'KeyP') { // press p to pass 
          setEmotionToCopy(getRandomEmotion());
        }
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
    };
    
  
    return (
      <div className="home-app">
  
        <div className='app-header'> {/** Top PART */}
          <div className='timer'>
            {seconds} {/** TBA */}
          </div>
          <div className='instruction'>
            <h2 className='instruction-header'>Copy this emotion</h2>
            <h1 className='emotion'>{emotionToCopy.toUpperCase()}</h1>
            <img className='emoji' src={statusIcons[emotionToCopy].emoji} alt="" />
          </div>
          <div className='points'>
            Points: {score}
          </div>
        </div>
  
        <div className='video-frame'> {/** Middle PART */}
          <div className='frame'>
            <canvas id='video-canvas'></canvas>
            <video ref={videoRef} onPlay={() => handlePlay(videoRef.current)} id='video' width={`${videoWidth}px`} height={`${videoHeight}px`} autoPlay muted></video>
          </div>
          <div className='emotion'>You are {emotion}</div>
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