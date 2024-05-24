import React, { useState, useEffect, useRef, } from 'react';
import '../css/over.css'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';


export default function Over({imageData}) {
    const navigate = useNavigate();
    let location = useLocation();
    const score = location.state === null ? 0 : location.state.score

    const handleKey = (event) => {
        if (event.key === "Escape") {
            navigate('/'); 
        } else if (event.key === "F1") {
            takeScreenshot();
        }
    }

    function takeScreenshot() {
        // Capture the entire document body
        html2canvas(document.body).then(function(canvas) {
            // Convert the canvas to a data URL
            var screenshotData = canvas.toDataURL('image/png');
            
            // Create an anchor element
            var link = document.createElement('a');
            link.href = screenshotData;
            link.download = 'screenshot.png';
            
            // Simulate a click event on the anchor tag
            link.click();
        });
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKey);
        
        imageData.map(element => {
            console.log(element.emotion)
            return null
        })
        return () => {
            document.removeEventListener("keydown", handleKey);
        }
    }, [])

    return (
        <div className='over-body'>
            <img className='overlay' src="/images/home-bg-overlay.png" alt="" />
            <div className='over-header'>
                <div className='button-container'>
                </div>
                <div className='name-container'>
                    <img src="/images/salamin_logo.png" alt="" />
                </div>
                <div className='score-container'>
                    <img src="/images/your_points.png" alt="" />
                    <p className='highlight'>{score}</p>
                </div>
            </div>
            <div className='images-container'>
                <div className='image-grids'>
                    {imageData.map((element, index) => {
                        if (index <= 5) {
                            return (
                                <div className="image" key={index}>
                                    <img src={element.URL} alt={element.emotion} />
                                    <p className='highlight'>{element.emotion}</p>
                                </div>
                            )
                        } else {
                            return null
                        }
                    })}
                </div>
            </div>
        </div>
    )
}