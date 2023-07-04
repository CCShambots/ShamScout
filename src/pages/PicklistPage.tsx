import React, {useEffect, useState} from "react";
import Header from "../components/header/Header";
import {ReactSortable} from "react-sortablejs";
import "./PicklistPage.css"
import {useLocalStorage} from "usehooks-ts";
import TeamLink from "../components/team-link/TeamLink";
import {Button, Checkbox, Dimmer} from "semantic-ui-react";

type Team = {
    name:string,
    number:number
}

type ItemType =  {
    id: number,
    team:Team
}



function PicklistPage() {

    const [currentEvent] = useLocalStorage("current-event", "")

    const [teams] = useLocalStorage<Team[]>(`teams-${currentEvent}`, [])

    const [savedPicks, setSavedPicks] = useLocalStorage<Team[]>(`pick-list-${currentEvent}`, teams)
    const [savedAccepts, setSavedAccepts] = useLocalStorage<Team[]>(`accept-list-${currentEvent}`, [])
    const [savedDeclines, setSavedDeclines] = useLocalStorage<Team[]>(`decline-list-${currentEvent}`, [])

    const [pickList, setPickList] = useState<ItemType[]>([]);

    const [acceptList, setAcceptList] = useState<ItemType[]>([]);

    const [declineList, setDeclineList] = useState<ItemType[]>([]);

    const [privacyDimmer, setPrivacyDimmer] = useState(false)
    
    //Load info
    useEffect(() => {

        let picksToApply = savedPicks;

        //Load picks into the saved picks if there are none present
        if(savedPicks.length === 0 && savedAccepts.length === 0 && savedDeclines.length === 0) {

            setSavedPicks(teams)
            picksToApply = teams
        }

        let id = 0
        setPickList(picksToApply.map(e => {
            id++
            return {id: id, team: e}
        }))

        id = 0
        setDeclineList(savedDeclines.map(e => {
            id++
            return {id: id, team: e}
        }))

        id = 0
        setAcceptList(savedAccepts.map(e => {
            id++
            return {id: id, team: e}
        }))
    }, [])

    //Save info on change
    useEffect(() => {

        setSavedPicks(pickList.map((e) => e.team))
        setSavedAccepts(acceptList.map((e) => e.team))
        setSavedDeclines(declineList.map((e) => e.team))

    }, [pickList, acceptList, declineList, setSavedPicks, setSavedAccepts, setSavedDeclines])

    return (
        <div>
            <Header/>

            <div className={"picklist-flex"}>
                <div className={"picklist-column"}>

                    <h1 className={"picklist-title"}>Picklist</h1>

                    <ReactSortable
                        group={"picklist"}
                        list={pickList}
                        setList={(result) => setPickList(result)}
                    >
                        {pickList.map((item) => (
                            <ItemDisplay item={item} itemIndex={pickList.indexOf(item)} accept={false} decline={false}/>
                        ))}
                    </ReactSortable>
                </div>

                <div className={"picklist-column"}>
                    <h1 className={"picklist-title"}>Accept</h1>

                    <ReactSortable
                        group={"picklist"}
                        list={acceptList}
                        setList={setAcceptList}
                    >
                        {acceptList.map((item) => (
                            <ItemDisplay item={item} itemIndex={acceptList.indexOf(item)} accept={true} decline={false}/>
                        ))}
                    </ReactSortable>

                    <h1 className={"picklist-title"}>Decline</h1>

                    <ReactSortable
                        group={"picklist"}
                        list={declineList}
                        setList={setDeclineList}
                    >
                        {declineList.map((item) => (
                            <ItemDisplay item={item} itemIndex={declineList.indexOf(item)} accept={false} decline={true}/>
                        ))}
                    </ReactSortable>
                </div>
            </div>

            <Button className={"privacy-button"} size={"massive"}
                    icon={"hide"} color={"red"} onClick={() => setPrivacyDimmer(true)}/>

            <Dimmer page
                    active={privacyDimmer}
                     // className={(privacyDimmer ? "privacy" : "")}
            >
                    <Button className={"close-privacy-button"} color={"red"} size={"massive"}
                            onClick={() => setPrivacyDimmer(false)}>Return to Picklist</Button>
            </Dimmer>
        </div>
    )
}

function ItemDisplay(props: {item:ItemType, itemIndex:number, accept:boolean, decline:boolean}) {

    let [taken, setTaken] = useState(false)

    return(
        <div className={"picklist-item-display " + (props.accept ? " accept " : "") + (props.decline ? " decline " : "") }>
            <div className={"picklist-item-flex"}>
                <Checkbox className={"picklist-check"} checked={taken} onChange={(e, data) => setTaken(data.checked!)} />

                <div className={"picklist-item-content"}>
                    <h1 className={"picklist-text"}>
                        {props.itemIndex + 1}. {props.item.team.number} - {props.item.team.name}
                    </h1>
                    <h1 className={"picklist-text"}>
                        <TeamLink number={props.item.team.number} displayText={"Team Page"}/>
                    </h1>
                    <div className={"picklist-item-crossoff " + (taken ? "crossed-off" : "") }/>
                </div>
            </div>
        </div>
    )
}

export default PicklistPage;