import React from "react";
import "./AddIcon.css"

type AddIconOptions = {
    setActive:(a:boolean) => void,
    triggerClick:() => void
}

function AddIcon({setActive, triggerClick}: AddIconOptions) {
    return(
        <div onClick={triggerClick} onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)} className={"add-icon-container"}>

            <svg className={"add-icon"} xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960" width="48">
                <path d="M450-200v-250H200v-60h250v-250h60v250h250v60H510v250h-60Z"/>
            </svg>
        </div>
    )
}

export default AddIcon