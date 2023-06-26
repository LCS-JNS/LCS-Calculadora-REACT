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

export const setFontSize = (value) => {
    const display = document.querySelector('.display')
    
    if(value === 14 || value === 16 || value === 18) {

        if(fontSize === 25) {
            return false
        } else {
            fontSize -= 5
        }
        display.style.fontSize = fontSize + 'px'
    }
    return true
}

export const resetFontSize = () => {
    const display = document.querySelector('.display')
    fontSize = 35
    display.style.fontSize = fontSize + 'px'
}

export const setErrorVisibility = tf => {
    const error = document.querySelector('.error')
    if(tf) {
        error.style.visibility = "visible"
    } else {
        error.style.visibility = "hidden"
    }
}
