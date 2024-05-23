import React, { useState, useEffect, useRef, } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export default function Over({imageData}) {
    console.log(imageData);
    let location = useLocation();
    const score = location.state === null ? 0 : location.state.score

    return (
        <p>Points: {score}</p>

    )
}