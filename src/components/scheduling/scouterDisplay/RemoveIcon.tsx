import React from "react";
import "./RemoveIcon.css"

type RemoveIconOptions = {
    setActive:(a:boolean) => void,
    triggerClick:() => void
}

function RemoveIcon({setActive, triggerClick}: RemoveIconOptions) {
    return(
        <div onClick={triggerClick} onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)} className={"remove-icon-container"}>
            <svg className={"remove-icon"} xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
                <path d="M200-450v-60h560v60H200Z"/>
            </svg>
        </div>
    )
}

export default RemoveIcon