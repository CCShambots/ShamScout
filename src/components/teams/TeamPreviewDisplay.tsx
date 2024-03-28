import React, {useEffect, useState} from "react";
import Picture from "../../resources/team_placeholder.png"

import "./TeamPreviewDisplay.css"
import {Link} from "react-router-dom";
import {doesTeamHaveImage, getImage} from "../../util/APIUtil";
import {useLocalStorage} from "usehooks-ts";
import {CURRENT_EVENT} from "../../util/LocalStorageConstants";
import {Icon, Popup} from "semantic-ui-react";

function TeamPreviewDisplay(props: {teamName:string, teamNum:number, setTeamNumber:(val:number) => void, isOldTeamImage:boolean, teamsInAPI:string[], isBlacklisted:boolean}) {

    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")
    let year = currentEvent.substring(0, 4)

    let [imageInAPI, setImageInAPI] = useState(false);

    useEffect(() => {
        setImageInAPI(props.teamsInAPI.includes(`${props.teamNum}-img-${year}`))
    }, [props.teamsInAPI]);

    useEffect(() => {
        if(imageInAPI) {
            props.setTeamNumber(props.teamNum)
        }
    }, [imageInAPI]);

    const [imgSrc, setImgSrc] = useState(Picture);

    useEffect(() => {
        if(imageInAPI) {
            loadImage().then(r => {})
        }
    }, [imageInAPI]);

    const customClass =
        imgSrc === Picture && imageInAPI ? "loading" : "loaded";

    let loadImage = async () => {
        const img = new Image();
        let src = await getImage(props.teamNum, currentEvent.substring(0, 4))
        img.src = src;
        img.onload = () => {
            setImgSrc(src);
        };
    }

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
                {
                    props.isBlacklisted ?
                        <Popup
                            content={"This team is blacklisted from being scouted!"}
                            trigger={
                                <Icon name={"list"} circular inverted className={"blacklist-icon"} color={"black"}/>
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