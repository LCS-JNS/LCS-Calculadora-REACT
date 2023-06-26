import React from "react";
import './Display.css'

let fontSize = 35

export default props => {

    let finalValue = props.value

    return (
        <div className="display">
            
            <p className="error" style={{ visibility: "hidden"}}>E</p>
            <p className="value">{finalValue}</p>
        </div>
    )
}

export const setErrorVisibility = tf => {
    const error = document.querySelector('.error')
    if(tf) {
        error.style.visibility = "visible"
    } else {
        error.style.visibility = "hidden"
    }
}
