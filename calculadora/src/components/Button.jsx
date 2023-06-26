import React from "react";
import './Button.css'
const isDisabled = false

export default props => {

    let propClass = 'button '
    propClass += props.double ? 'double ' : ''
    propClass += props.operator ? 'operator' : ''

    return(
        <button className={propClass} onClick={e => props.click(props.lable)}>
        {props.lable}
        </button>
    )
}