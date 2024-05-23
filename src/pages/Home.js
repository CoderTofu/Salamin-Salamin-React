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
const getRandomEmotion = (lastIdx) => {
  let randint;
  do{
    randint = Math.floor(Math.random() * emojis.length)
  } while (randint === lastIdx.current);
  lastIdx.current = randint;
  let emoji = emojis[randint];
  return emoji;
}

export default function Home({setImageData}) {
    const time = 15;
    const [seconds, setSeconds] = useState(time); // Timer
    const [score, setScore] = useState(0); // scoring
    const [hasStarted, setHasStarted] = useState(null); // checks if game started
    const lastIdx = useRef(-1);   // ensures no consecutive duplicates
    const [emotionToCopy, setEmotionToCopy] = useState(() => getRandomEmotion(lastIdx)); // instruction
    const [emotion, setEmotion] = useState(''); // detected emotion 
    const [borderColor, setBorderColor] = useState('black'); // video border
    const [btnDisabled, setBtnDisabled] = useState(false);
    
    const emotionToCopyRef = useRef(emotionToCopy);
    const emotionRef = useRef(emotion);
    const hasStartedRef = useRef(hasStarted);

    useEffect(() => {
      emotionToCopyRef.current = emotionToCopy;
    }, [emotionToCopy]);
  
    useEffect(() => {
      emotionRef.current = emotion;
    }, [emotion]);
  
    useEffect(() => {
      hasStartedRef.current = hasStarted;
    }, [hasStarted]);

    // Video Stuff
    const videoRef = useRef();
    const videoWidth = 915;
    const videoHeight = 540;
    const videoSize = { width: videoWidth, height: videoHeight };
    const videoCanvasRef = useRef(null); // Use useRef for mutable variable

    const navigate = useNavigate();

    // timer
    useEffect(() => {
      if(!hasStarted){
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
    }, [hasStarted, seconds]);
  

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

    // FOR KEY PRESSES
    useEffect(() => {
        document.addEventListener('keydown', handleKey);
        setImageData([]);
        return () => {
            document.removeEventListener("keydown", handleKey);
        }
    }, [])

  
    // To detect emotions
    const handlePlay = (video) => {
      faceapi.matchDimensions(videoCanvasRef.current, videoSize);
      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        if(detections.length === 0){
          setEmotion("neutral")
          setBorderColor(null)
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

    const handleEnterBtn = () => {
      handleEnter();
      setBtnDisabled(true)
      setTimeout(() => {
        setBorderColor("black")
        setEmotionToCopy(getRandomEmotion(lastIdx));
        setBtnDisabled(false);
      }, 1000);
    }

    const handlePassBtn = () => {
      setHasStarted(true);
      setEmotionToCopy(getRandomEmotion(lastIdx));
    }

    const handleEnter = () => {
      setHasStarted(true);
      if(emotionToCopyRef.current === emotionRef.current) {
        setScore((score) => score + 1)
        setBorderColor("green");
      } else{
        setBorderColor("red");
      }
      takeScreenshot();
    }

    const handleKey = (event) => {
        if (event.code === 'Space') {
          handleEnter();
          document.removeEventListener('keydown', handleKey);
          setTimeout(() => {
            setBorderColor("black")
            setEmotionToCopy(getRandomEmotion(lastIdx));
            document.addEventListener('keydown', handleKey);
          }, 1000)
        }
        else if(event.code === 'KeyP') { // press p to pass 
          handlePassBtn();
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
                emotion: emotionToCopyRef.current, // Assuming emotion is defined somewhere
                URL: dataURL
            }
        ]);
    };

    const handlePause = () => {
      setBtnDisabled(hasStartedRef.current);
      setHasStarted(!hasStartedRef.current);
    }

    const handleRestart = () => {
      setHasStarted(null);
      hasStartedRef.current = null;
      setSeconds(time);
      setEmotionToCopy(getRandomEmotion(lastIdx));
      setBtnDisabled(false);
      setImageData([]);
    }
  
    return (
      <div className="home-app">
  
        <div className='app-header'> 
          <div className='timer'>
            {seconds} 
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
            <video onPlay={() => handlePlay(videoRef.current)} id='video' width={`${videoWidth}px`} height={`${videoHeight}px`} style={{border: `2px solid ${borderColor}`}} ref={videoRef} autoPlay muted></video> 
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
              <h3>Enter</h3>
              <button onClick={() => handleEnterBtn()} disabled={btnDisabled}>Space</button>
              <button onClick={() => handlePassBtn()} disabled={btnDisabled}>Pass</button>
              {
                hasStartedRef.current === null ? null: 
                <>
                  <button onClick={() => handlePause()}>{hasStartedRef.current ? "Pause" : "Play"}</button>
                  <button onClick={() => handleRestart()}>Restart</button>
                </>
              }              
            </div>
            <div>
                <Link to={`/over`}>TEST</Link>
            </div>
          </div>
        </div>
      </div>
    );
}