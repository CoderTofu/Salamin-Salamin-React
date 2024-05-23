import React, { useState, useEffect, useRef, } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import '../css/over.css'

export default function Over({imageData}) {
    let location = useLocation();
    const score = location.state === null ? 0 : location.state.score

    return (
        <div>
            <p>Points: {score}</p>
            <div className='image-container'>
                {imageData.map((element, index) => {
                    return (
                        <div>
                            <img key={index} src={element.URL} alt={element.emotion} />
                            <p>{element.emotion}</p>
                        </div>
                    )
                })}
            </div>
        </div>
        
    )
}