import "./PicklistTeamDisplay.css"
import TeamLink from "../team-link/TeamLink";
import {Team} from "../../pages/TeamViewPage";
import {useEffect, useState} from "react";
import {active} from "sortablejs";

export type PercentData = {
    name:string,
    value:number
}

export default function PicklistTeamDisplay(props:
{color:string, team:Team, left:boolean, thisData:PercentData[], otherData:PercentData[], onClick:() => void}
) {

    let [activeTeam, setActiveTeam] = useState(props.team)
    let [activeThisData, setActiveThisData] = useState(props.thisData)
    let [activeOtherData, setActiveOtherData] = useState(props.otherData)
    let [transitioning, setTransitioning] = useState(false)

    useEffect(() => {
        if(activeTeam.number !== props.team.number) {
            setTransitioning(true)
            
            setTimeout(() => {
                    setTransitioning(false)
                    setActiveTeam(props.team)
                    setActiveThisData(props.thisData)
                    setActiveOtherData(props.otherData)
                },
                300
            )
        } else {

            //Loading stats for the first team
            setActiveThisData(props.thisData)
            setActiveOtherData(props.otherData)
        }
    }, [activeTeam, props.thisData, props.otherData, props.team]);

    return (
        <div
            style={{backgroundColor: props.color}}
            className={"team-vs-display " + (transitioning ? "transitioning" : "")}
            onClick={props.onClick}
        >
            <h1 className={"vs-team-header"}>
                <TeamLink number={activeTeam.number} displayText={activeTeam.number + " - " + activeTeam.name}/>
            </h1>
            <div className={"boolean-container"}>
                {
                    props.left ?
                    activeThisData.map(e =>
                        <div className={"team-boolean-value " +
                            (activeOtherData[activeThisData.indexOf(e)].value < e.value ? " higher " : "lower") +
                            (activeOtherData[activeThisData.indexOf(e)].value === e.value ? " equal " : "")
                        }>
                            <h3>{e.name}</h3>
                            <h3>{e.value}%</h3>
                        </div>
                    ) :
                    activeThisData.map(e =>
                        <div className={"team-boolean-value " +
                            (activeOtherData[activeThisData.indexOf(e)].value < e.value ? " higher " : " lower") +
                            (activeOtherData[activeThisData.indexOf(e)].value === e.value ? " equal " : "")
                        }>
                            <h3>{e.value}%</h3>
                            <h3>{e.name}</h3>
                        </div>
                    )
                }
            </div>
        </div>
    )
}