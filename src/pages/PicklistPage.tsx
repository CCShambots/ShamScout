import React, {createRef, useEffect, useRef, useState} from "react";
import AppHeader from "../components/header/AppHeader";
import {ReactSortable} from "react-sortablejs";
import "./PicklistPage.css"
import {useLocalStorage} from "usehooks-ts";
import TeamLink from "../components/team-link/TeamLink";
import {Button, Checkbox, Dimmer, Header, Icon, Input} from "semantic-ui-react";
import {ACCEPT_LIST, CURRENT_EVENT, DECLINE_LIST, PICKLIST, TEAMS} from "../util/LocalStorageConstants";
import StatsPopoutManager from "../components/picklist/StatsPopoutManager";
import {CSVLink} from "react-csv";
import {upload} from "@testing-library/user-event/dist/upload";


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

    let downloadCSVRef:any = createRef()

    let uploadCSVRef:any = createRef()

    let [downloadData, setDownloadData] = useState<string[][]>([])
    let [importConfirmationActive, setImportConfirmationActive] = useState(false)

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

    useEffect(() => {

        let newData:string[][] = []

        let maxLen = Math.max(pickList.length, acceptList.length, declineList.length)

        for(let i = 0; i<maxLen; i++) {
            let row:string[] = []
            if(pickList[i]) {
                row.push(pickList[i].team.number.toString() + "-" + pickList[i].team.name)
            } else {
                row.push("")
            }

            if(acceptList[i]) {
                row.push(acceptList[i].team.number.toString()+ "-" + acceptList[i].team.name)
            } else {
                row.push("")
            }

            if(declineList[i]) {
                row.push(declineList[i].team.number.toString()+ "-" + declineList[i].team.name)
            } else {
                row.push("")
            }

            newData.push(row)
        }

        setDownloadData([...newData])

    }, [pickList, acceptList, declineList]);

    const fileReader = new FileReader();


    const handleUploadChange = (e:any) => {

        if (e.target.files[0]) {
            fileReader.onload = function (event) {
                const csvOutput = event.target?.result;

                let splitRows = (csvOutput! as string).replaceAll('"', '').split("\n")

                let splitEntries = splitRows.map(e => e.split(","))

                console.log(splitEntries)

                let pick:Team[] = []
                let accept:Team[] = []
                let decline:Team[] = []

                for(let i = 1; i<splitEntries.length; i++) {
                    for(let col = 0; col<3; col++) {
                        if(splitEntries[i][col] === "") continue

                        let thisVal = splitEntries[i][col].split("-")
                        console.log(thisVal)
                        if(col === 0) {
                            pick.push({number: parseInt(thisVal[0]), name: thisVal[1]})
                        } else if(col === 1) {
                            accept.push({number: parseInt(thisVal[0]), name: thisVal[1]})
                        } else {
                            decline.push({number: parseInt(thisVal[0]), name: thisVal[1]})
                        }

                    }
                }

                setSavedPicks(pick)
                setSavedAccepts(accept)
                setSavedDeclines(decline)

                window.location.reload()
            };

            fileReader.readAsText(e.target.files[0]);

        }
    };

    return (
        <div>
            <AppHeader/>
            <Button.Group fluid>
                <Button color={"blue"} onClick={() => downloadCSVRef.current.link.click()}><Icon name={"download"}/>Export</Button>
                <Button color={"green"} onClick={() => setImportConfirmationActive(true)}><Icon name={"upload"}/>Import</Button>
                <Button color={"red"}><Icon name={"redo"}/>Reset to Event Rankings</Button>
            </Button.Group>

            <CSVLink ref={downloadCSVRef} headers={["pick", "accept", "decline"]} data={downloadData} filename={`picklist-${currentEvent}.csv`}/>

            <input ref={uploadCSVRef} className={"hide-csv-upload"} type={"file"} accept={".csv"} onChange={handleUploadChange}/>

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

            <Dimmer page active={importConfirmationActive} onClickOutside={() => {setImportConfirmationActive(false)}}>
                <Header inverted>
                    This will overwrite your current picklist. Are you sure you want to continue?
                </Header>
                <Button color={"red"} onClick={() => {
                    uploadCSVRef.current.click()
                    setImportConfirmationActive(false)
                }}>Yes, I'm Sure</Button>
            </Dimmer>

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