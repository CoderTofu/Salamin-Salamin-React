import * as faceapi from 'face-api.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


let statusIcons = {
  angry: { emoji: '/emojis/angry.png' },
  disgusted: { emoji: '/emojis/disgusted.png' },
  happy: { emoji: '/emojis/happy.png' },
  sad: { emoji: '/emojis/sad.png' },
  surprised: { emoji: '/emojis/surprised.png' },
  neutral: { emoji: '/emojis/neutral.png' }
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
    const videoWidth = 668.8;
    const videoHeight = 534.4;
    const videoSize = { width: videoWidth, height: videoHeight };
    const videoCanvasRef = useRef(null); // Use useRef for mutable variable

    const navigate = useNavigate();

    // timer
    useEffect(() => {
      let timer;
      if (hasStarted && !isPaused) {
        timer = setInterval(() => {
          setSeconds(prev => prev - 1);
        }, 1000);
      }
    
      if (seconds < 0) {
        clearInterval(timer);
        navigate('/over', { state: { score } });
      }
    
      return () => clearInterval(timer);
    }, [hasStarted, seconds, isPaused, score, navigate]);
  

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
        return () => {
          // Cleanup video stream
          if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
          }
        };
    }, []);

    // FOR KEY PRESSES
    useEffect(() => {
        document.addEventListener('keydown', handleKey);
        setImageData([]);
        return () => {
            document.removeEventListener("keydown", handleKey);
        }
    }, [])

    const setEmotionDebounced = (newEmotion) => {
      if (newEmotion !== emotionRef.current) {
        emotionRef.current = newEmotion;
      }
    };
  
    // To detect emotions
    const handlePlay = (video) => {
      faceapi.matchDimensions(videoCanvasRef.current, videoSize);
      const detectFace = async () => {
          const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
          if (detections.length === 0) {
            setEmotionDebounced('neutral');
            return;
          }
      
          const resizedDetections = faceapi.resizeResults(detections, videoSize);
          const maxExpression = Object.entries(resizedDetections[0].expressions).reduce((max, [expression, confidence]) => {
            return confidence > max.confidence ? { expression, confidence } : max;
          }, { expression: null, confidence: 0 });
        
          setEmotion(maxExpression.expression);
          emotionRef.current = maxExpression.expression;

          const context = videoCanvasRef.current.getContext('2d');
          context.clearRect(0, 0, videoCanvasRef.current.width, videoCanvasRef.current.height);
          faceapi.draw.drawDetections(videoCanvasRef.current, resizedDetections);
          faceapi.draw.drawFaceExpressions(videoCanvasRef.current, resizedDetections);
      };
        const interval = setInterval(detectFace, 100);
        return () => clearInterval(interval);
    };

    const handlePassBtn = () => {
      if(!hasStartedRef.current) setHasStarted(true);
      setEmotionToCopy(getRandomEmotion(lastIdx));
    }

    const handleEnter = () => {
      if(!hasStarted.current) setHasStarted(true);
      if(emotionToCopyRef.current === emotionRef.current) {
        setScore((score) => score + 1)
        setBorderColor("green");
      } else{
        setBorderColor("red");
      }
      takeScreenshot();
    }

    const handleKey = (event) => {
      if(!isPausedRef.current){
        if (event.code === 'Enter' || event.code === 'NumpadEnter') {
          handleEnter();
          const timeout = setTimeout(() => {
            setBorderColor("white");
          }, 800);
          setEmotionToCopy(getRandomEmotion(lastIdx));
          return () => clearTimeout(timeout);
        }
        else if(event.code === 'Digit0' || event.code === 'Numpad0') {
          handlePassBtn();
        }
        else if(event.code === 'NumpadAdd'){
          setIsPaused(true);
        }
      }
      else{
        if(event.code === 'Digit1' || event.code === 'Numpad1' || event.code === 'NumpadAdd') {
          setIsPaused(false);
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
      setIsPaused(false);
      setSeconds(time);
      setEmotionToCopy(getRandomEmotion(lastIdx));
      setImageData([]);
    }
    
    return (
      <div className={`home-app ${emotion}`}>
        <div className='design-grid'></div>
        <div className='design-underlay'></div>
        <div className='app-header'> 
          <div className='timer'>
            {seconds} 
          </div>
          <div className='instruction'>
            <img className='instruction-header' src='/images/mirror-this.png' alt='instruction'/>
            <h2 className='emotion'>{emotionToCopy.toUpperCase()}</h2>
            <img className='emoji' src={statusIcons[emotionToCopy].emoji} alt="" />
          </div>
          <div className='points'>
            <img src='/images/points.png' alt='points'/>
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