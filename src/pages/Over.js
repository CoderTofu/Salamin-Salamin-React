import React, { useState, useEffect, useRef, } from 'react';
import '../css/over.css'

export default function Over({imageData}) {

    console.log(imageData)

    return (
        <div className='image-container'>
            {imageData.map((element, index) => {
                return (
                    <img key={index} src={element.URL} alt={element.emoji} />
                )
            })}
        </div>
    )
}