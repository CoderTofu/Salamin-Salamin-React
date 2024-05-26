import * as faceapi from 'face-api.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


let statusIcons = {
  angry: { emoji: '/emojis/angry.png', color: '#b64518' },
  disgusted: { emoji: '/emojis/disgusted.png', color: '#1a8d1a' },
  happy: { emoji: '/emojis/happy.png', color: '#148f77' },
  sad: { emoji: '/emojis/sad.png', color: '#767e7e' },
  surprised: { emoji: '/emojis/surprised.png', color: '#1230ce' },
  neutral: { emoji: '/emojis/neutral.png', color: '#54adad' }
}
const emojis = Object.keys(statusIcons);
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
    const [hasStarted, setHasStarted] = useState(false); // checks if game started
    const lastIdx = useRef(-1);   // ensures no consecutive duplicates
    const [emotionToCopy, setEmotionToCopy] = useState(() => getRandomEmotion(lastIdx)); // instruction
    const [emotion, setEmotion] = useState(''); // detected emotion 
    const [borderColor, setBorderColor] = useState('white'); // video border
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    
    const emotionToCopyRef = useRef(emotionToCopy);
    const emotionRef = useRef(emotion);

    const hasStartedRef = useRef(hasStarted);
    const isPausedRef = useRef(isPaused);

    useEffect(() => {
      emotionToCopyRef.current = emotionToCopy;
    }, [emotionToCopy]);
  
    useEffect(() => {
      emotionRef.current = emotion;
    }, [emotion]);

    useEffect(() => {
      hasStartedRef.current = hasStarted;
    }, [hasStarted]);

    useEffect(() => {
      isPausedRef.current = isPaused;
    }, [isPaused]);

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
      if(seconds < 0){
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

    const handlePassBtn = () => {
      setHasStarted(true);
      setEmotionToCopy(getRandomEmotion(lastIdx));
    }

    const handleEnter = () => {
      setHasStarted(true);
      takeScreenshot();
      if(emotionToCopyRef.current === emotionRef.current) {
        setScore((score) => score + 1)
        setBorderColor("green");
      } else{
        setBorderColor("red");
      }
    }

    const handleKey = (event) => {
      if(!isPausedRef.current){
        if (event.code === 'Enter' || event.code === 'NumpadEnter') {
          handleEnter();
          setEmotionToCopy(getRandomEmotion(lastIdx));
          setTimeout(() => {
            setBorderColor("white");
          }, 1000)
        }
        else if(event.code === 'Digit0' || event.code === 'Numpad0') {
          handlePassBtn();
        }
        else if(event.code === 'Delete' && hasStartedRef.current){
          handlePause();
        }
      }
      else{
        if(event.code === 'Digit1' || event.code === 'Numpad1' || event.code === 'Delete') {
          handleResume();
        }
        else if(event.code === 'Digit2' || event.code === 'Numpad2') {
          handleRestart();
        }
        else if (event.code === 'Digit3' || event.code === 'Numpad3') {
          navigate('/');
        }
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
            {
                emotion: emotionToCopyRef.current, // Assuming emotion is defined somewhere
                URL: dataURL
            },
            ...prevData
        ]);
    };

    const handleRestart = () => {
      setHasStarted(false);
      setSeconds(time);
      setEmotionToCopy(getRandomEmotion(lastIdx));
      setBtnDisabled(false);
      setImageData([]);
      setIsPaused(false);
    }
    
    const handleResume = () => {
      setHasStarted(true);
      setIsPaused(false);
    }

    const handlePause = () => {
      setHasStarted(false);
      setIsPaused(true);
    } 
    
    return (
      <div className="home-app">
        <div className='app-header'> 
          <div className='timer'>
            {seconds} 
          </div>
          <div className='instruction'>
            <img className='instruction-header' src='/images/mirror-this.png'/>
            <h2 className='emotion'>{emotionToCopy.toUpperCase()}</h2>
            <img className='emoji' src={statusIcons[emotionToCopy].emoji} alt="" />
          </div>
          <div className='points'>
            <img src='/images/points.png' />
            {score}
          </div>
        </div>
  
        <div className='video-frame'> {/** Middle PART */}
          <div className='frame'>
            <canvas id='video-canvas'></canvas>
            <video onPlay={() => handlePlay(videoRef.current)} id='video' width={`${videoWidth}px`} height={`${videoHeight}px`} style={{border: `15px solid ${borderColor}`}} ref={videoRef} autoPlay muted></video> 
          </div>
          <div className='emotion'>YOU: {emotion.toUpperCase()}</div>
        </div>
        {
          isPaused ?
          <div className="popup">
              <div className="popup-inner">
              <div className='wrapper'></div>
              </div>
          </div>
          : null
        }
        <div className='app-footer'> {/** Bottom PART */}
        </div>
      </div>
    );
}