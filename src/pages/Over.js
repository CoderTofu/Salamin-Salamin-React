import React, { useState, useEffect, useRef, } from 'react';

export default function Over({imageData}) {

    console.log(imageData)

    return (
        <div>
            {imageData.map((element, index) => {
                return (
                    <img key={index} src={element.URL} alt={element.emoji} />
                )
            })}
        </div>
    )
}