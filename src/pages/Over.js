import React, { useState, useEffect, useRef, } from 'react';
import '../css/over.css'
import { Link, useLocation, useParams } from 'react-router-dom';


export default function Over({imageData}) {
    let location = useLocation();
    const score = location.state === null ? 0 : location.state.score

    return (
        <div className='over-body'>
            <div className='over-header'>
                <div className='button-container'>
                    <Link to={"/"}><button>X</button></Link>
                </div>
                <div className='name-container'>
                    <h1>Salamin-Salamin</h1>
                </div>
                <div className='score-container'>
                    <p>Points: {score}</p>
                </div>
            </div>
            <div className='images-container'>
                <div className='image-grids'>
                    {imageData.map((element, index) => {
                        return (
                            <div className="image" key={index}>
                                <img src={element.URL} alt={element.emotion} />
                                <p>{element.emotion}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
            
        </div>
        
    )
}