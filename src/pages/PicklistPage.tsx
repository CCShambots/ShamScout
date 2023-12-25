import React, {useEffect, useState} from "react";
import AppHeader from "../components/header/AppHeader";
import {ReactSortable} from "react-sortablejs";
import "./PicklistPage.css"
import {useLocalStorage} from "usehooks-ts";
import TeamLink from "../components/team-link/TeamLink";
import {Button, Checkbox, Icon} from "semantic-ui-react";
import {ACCEPT_LIST, CURRENT_EVENT, DECLINE_LIST, PICKLIST, TEAMS} from "../util/LocalStorageConstants";
import StatsPopoutManager from "../components/picklist/StatsPopoutManager";

type Team = {
    name:string,
    number:number
}

type ItemType =  {
    id: number,
    team:Team
}

function PicklistPage() {

    const [currentEvent] = useLocalStorage(CURRENT_EVENT, "")

    const [teams] = useLocalStorage<Team[]>(TEAMS(currentEvent), [])

    const [savedPicks, setSavedPicks] = useLocalStorage<Team[]>(PICKLIST(currentEvent), teams)
    const [savedAccepts, setSavedAccepts] = useLocalStorage<Team[]>(ACCEPT_LIST(currentEvent), [])
    const [savedDeclines, setSavedDeclines] = useLocalStorage<Team[]>(DECLINE_LIST(currentEvent), [])

    const [pickList, setPickList] = useState<ItemType[]>([]);

    const [acceptList, setAcceptList] = useState<ItemType[]>([]);

    const [declineList, setDeclineList] = useState<ItemType[]>([]);

    const [privacyDimmer, setPrivacyDimmer] = useState(false)

    const [teamStatsList, setTeamStatsList] = useState<{number: number, name:string}[]>([])
    
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

    let addTeamToStatsList = (team:Team) => {
        if(!teamStatsList.map(e => e.number).includes(team.number)) {
            setTeamStatsList([...teamStatsList, team])
        }
    }

    return (
        <div>
            <AppHeader/>

            <div className={"picklist-flex"}>
                <div className={"picklist-column"}>

                    <h1 className={"picklist-title"}>Picklist</h1>

                    <ReactSortable
                        group={"picklist"}
                        list={pickList}
                        setList={(result) => setPickList(result)}
                        className={"picklist-sortable"}
                    >
                        {pickList.map((item) => (
                            <ItemDisplay
                                item={item}
                                itemIndex={pickList.indexOf(item)}
                                accept={false}
                                decline={false}
                                addSelfToStats={addTeamToStatsList}
                                statsListLength={teamStatsList.length}
                                key={item.team.number}
                            />
                        ))}
                    </ReactSortable>
                </div>

                <div className={"picklist-column"}>
                    <h1 className={"picklist-title"}>Accept</h1>

                    <ReactSortable
                        group={"picklist"}
                        list={acceptList}
                        setList={setAcceptList}
                        className={"picklist-sortable"}

                    >
                        {acceptList.map((item) => (
                            <ItemDisplay
                                item={item}
                                itemIndex={acceptList.indexOf(item)}
                                accept={true}
                                decline={false}
                                statsListLength={teamStatsList.length}
                                addSelfToStats={addTeamToStatsList}
                                key={item.team.number}
                            />
                        ))}
                    </ReactSortable>

                    <h1 className={"picklist-title"}>Decline</h1>

                    <ReactSortable
                        group={"picklist"}
                        list={declineList}
                        setList={setDeclineList}
                        className={"picklist-sortable"}
                    >
                        {declineList.map((item) => (
                            <ItemDisplay
                                item={item}
                                itemIndex={declineList.indexOf(item)}
                                accept={false}
                                decline={true}
                                statsListLength={teamStatsList.length}
                                addSelfToStats={addTeamToStatsList}
                                key={item.team.number}
                            />
                        ))}
                    </ReactSortable>
                </div>
                <StatsPopoutManager teamsArray={teamStatsList} setTeamsArray={setTeamStatsList}/>
            </div>

            {
                teamStatsList.length <= 1 ?
                    <Button className={"privacy-button"} size={"massive"}
                            icon={"hide"} color={"red"} onClick={() => setPrivacyDimmer(true)}/>
                    : <div/>
            }

            {
                teamStatsList.length > 1 ?
                    <div className={"privacy-button-centered"}>
                        <Button size={"massive"}
                                icon={"hide"} color={"red"} onClick={() => setPrivacyDimmer(true)}/>
                    </div> : <div/>
            }

            <div
                className={(privacyDimmer) ? "privacy-active" : "privacy-inactive"}
                onClick={() => setPrivacyDimmer(false)}
            />

        </div>
    )
}

function ItemDisplay(props: {item:ItemType, itemIndex:number, accept:boolean, decline:boolean, statsListLength:number, addSelfToStats:(team:Team) => void}) {

    let [taken, setTaken] = useState(false)

    return(
        <div className={"picklist-item-display " + (props.accept ? " accept " : "") + (props.decline ? " decline " : "") + (taken ? " crossed-off-item " : "") }>
            <div className={"picklist-item-flex"}>
                <Icon name={"list"} size={"large"}/>

                <Checkbox className={"picklist-check"} checked={taken} onChange={(e, data) => setTaken(data.checked!)} />

                <div className={"picklist-item-content"}>
                    <h2 className={"picklist-text"}>
                        <TeamLink number={props.item.team.number} displayText={`${props.itemIndex + 1}. ${props.item.team.number} - ${props.item.team.name}`}/>
                    </h2>

                    <Button icon={"info"} color={"grey"} size={"small"} disabled={props.statsListLength >= 4} onClick={() => {
                        props.addSelfToStats(props.item.team)
                    }}/>
                    <div className={"picklist-item-crossoff " + (taken ? "crossed-off" : "") }/>
                </div>
            </div>
        </div>
    )
}

export default PicklistPage;