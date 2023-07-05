import React from "react";
import FirstLogo from "../../resources/first_icon.png"
import "./Banner.css"

function Banner(props: {event:string}) {
    return (
        <div className={"banner"}>
            <img src={FirstLogo} alt={"failed"}/>
            <div className={"award-name"}>
                <span>Winner</span>
            </div>
            <div className={"award-event"}>
                <span>{props.event}</span>
            </div>
        </div>
    )
}

export default Banner;