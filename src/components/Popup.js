import React from "react";

export default function Popup(props){
    return ( (props.trigger) ?
        <div className="popup">
            <div className="popup-inner">
                { props.children }
                <button className="exit-btn" onClick={() => props.handleExit()}>Exit</button>
            </div>
        </div>
        : null
    ) 
}