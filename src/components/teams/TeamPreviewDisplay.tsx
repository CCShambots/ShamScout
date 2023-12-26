import React, {useEffect, useState} from "react";
import Picture from "../../resources/team_placeholder.png"

import "./TeamPreviewDisplay.css"
import {Link} from "react-router-dom";
import {doesTeamHaveImage, getImagePath} from "../../util/APIUtil";
import {useLocalStorage} from "usehooks-ts";
import {CURRENT_EVENT} from "../../util/LocalStorageConstants";
import {Icon, Popup} from "semantic-ui-react";

function TeamPreviewDisplay(props: {teamName:string, teamNum:number, setTeamNumber:(val:number) => void, isOldTeamImage:boolean}) {

    let [imageInAPI, setImageInAPI] = useState(false)

    useEffect(() => {
        doesTeamHaveImage(props.teamNum).then((result) => {setImageInAPI(result)});
    }, [props.teamNum]);

    useEffect(() => {
        if(imageInAPI) {
            props.setTeamNumber(props.teamNum)
        }
    }, [imageInAPI]);

    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")

    const src = getImagePath(props.teamNum, currentEvent.substring(0, 4))

    const [imgSrc, setImgSrc] = useState(Picture || src);

    useEffect(() => {
        if(imageInAPI) {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                setImgSrc(src);
            };
        }
    }, [src, imageInAPI]);

    const customClass =
        imgSrc === Picture && imageInAPI ? "loading" : "loaded";

    return (
        <Link to={`/team?number=${props.teamNum}`}>
            <div className={"team-display-container"}>
                {
                    props.isOldTeamImage ?
                        <Popup
                            content={"This image is old and may not be accurate!"}
                            trigger={
                            <Icon name={"history"} circular inverted className={"old-icon"} color={"red"}/>
                        }
                        />
                    : <div/>
                }
                <div className={"team-display-image-container"}>
                    {
                        <img className={`team-display-image ${customClass}`}
                             src={imgSrc} alt={props.teamNum.toString()}/>
                    }
                </div>
                <div className={"team-display-info"}>
                    <h3 className={"team-display-text"}>{props.teamNum}</h3>
                    <h3 className={"team-display-text"}>{props.teamName}</h3>
                </div>
            </div>
        </Link>
    )
}

export default TeamPreviewDisplay;