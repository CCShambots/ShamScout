import React, {createRef, useEffect, useState} from "react";
import AppHeader from "../components/header/AppHeader";
import {ReactSortable} from "react-sortablejs";
import "./PicklistPage.css"
import {useLocalStorage} from "usehooks-ts";
import TeamLink from "../components/team-link/TeamLink";
import {Button, Checkbox, Dimmer, Header, Icon, Popup, TextArea} from "semantic-ui-react";
import {
    ACCEPT_LIST,
    BLACKLIST,
    COMMENTS,
    CURRENT_EVENT,
    DECLINE_LIST,
    PICKLIST,
    TEAMS
} from "../util/LocalStorageConstants";
import StatsPopoutManager from "../components/picklist/StatsPopoutManager";
import {CSVLink} from "react-csv";
import {doesTeamHaveImage, getImage, PullTBA} from "../util/APIUtil";
import {team} from "./TeamsPage";


type Team = {
    name:string,
    number:number
}

type PicklistTeam = {
    name:string,
    number:number,
    taken:boolean
}

function teamsToPicklistTeams(teams:Team[]) {
    return teams.map(e => {
        return {name: e.name, number: e.number, taken: false}
    })
}

type ItemType =  {
    id: number,
    team:PicklistTeam
}

function PicklistPage() {

    const [currentEvent] = useLocalStorage(CURRENT_EVENT, "")

    const [teams] = useLocalStorage<Team[]>(TEAMS(currentEvent), [])

    const [savedPicks, setSavedPicks] = useLocalStorage<PicklistTeam[]>(PICKLIST(currentEvent), teamsToPicklistTeams(teams))
    const [savedAccepts, setSavedAccepts] = useLocalStorage<PicklistTeam[]>(ACCEPT_LIST(currentEvent), [])
    const [savedDeclines, setSavedDeclines] = useLocalStorage<PicklistTeam[]>(DECLINE_LIST(currentEvent), [])

    const [pickList, setPickList] = useState<ItemType[]>([]);

    const [acceptList, setAcceptList] = useState<ItemType[]>([]);

    const [declineList, setDeclineList] = useState<ItemType[]>([]);

    const [privacyDimmer, setPrivacyDimmer] = useState(false)

    let [blackList,] = useLocalStorage<team[]>(BLACKLIST(currentEvent),[])

    const [teamStatsList, setTeamStatsList] = useState<{number: number, name:string}[]>([])

    let downloadCSVRef:any = createRef()

    let uploadCSVRef:any = createRef()

    let [downloadData, setDownloadData] = useState<string[][]>([])
    let [importConfirmationActive, setImportConfirmationActive] = useState(false)

    let [resetToEventRankingsCofnirmationActive, setResetToEventTrankingsConfirmationActive] = useState(false)

    //Load info
    useEffect(() => {
        let picksToApply = savedPicks;

        //Load picks into the saved picks if there are none present
        if(savedPicks.length === 0 && savedAccepts.length === 0 && savedDeclines.length === 0) {

            setSavedPicks(teamsToPicklistTeams(teams))
            picksToApply = teamsToPicklistTeams(teams)
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
        setTimeout(() => {
            setSavedPicks(pickList.map((e) => e.team))
            setSavedAccepts(acceptList.map((e) => e.team))
            setSavedDeclines(declineList.map((e) => e.team))
            },
            50
        )


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

    const handleFileUpload = (e:any) => {

        if (e.target.files[0]) {
            fileReader.onload = function (event) {
                const csvOutput = event.target?.result;

                let splitRows = (csvOutput! as string).replaceAll('"', '').split("\n")

                let splitEntries = splitRows.map(e => e.split(","))

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

                setSavedPicks(teamsToPicklistTeams(pick))
                setSavedAccepts(teamsToPicklistTeams(accept))
                setSavedDeclines(teamsToPicklistTeams(decline))

                window.location.reload()
            };

            fileReader.readAsText(e.target.files[0]);

        }
    };

    const resetToEventRankings = () => {
        PullTBA("event/" + currentEvent + "/rankings", (data) => {

            console.log(data.rankings)
            let rankList = data.rankings

            let newPicklist:Team[] = []

            let numberRankList = rankList.map((e:any) => {
                return parseInt(e.team_key.substring(3))
            })

            savedPicks.sort((a, b) => {
                let aIndex = numberRankList.indexOf(a.number)
                let bIndex = numberRankList.indexOf(b.number)

                if(aIndex === -1) aIndex= 90000
                if(bIndex === -1) bIndex= 90000

                return aIndex - bIndex
            })

            setSavedPicks([...savedPicks])
            setSavedAccepts([])
            setSavedDeclines([])

            window.location.reload()
        })
    }

    return (
        <div>
            <AppHeader/>
            <Button.Group fluid>
                <Button color={"blue"} onClick={() => downloadCSVRef.current.link.click()}><Icon name={"download"}/>Export</Button>
                <Button color={"green"} onClick={() => setImportConfirmationActive(true)}><Icon name={"upload"}/>Import</Button>
                <Button color={"red"} onClick={() => setResetToEventTrankingsConfirmationActive(true)}><Icon name={"redo"}/>Reset to Event Rankings</Button>
            </Button.Group>

            <CSVLink ref={downloadCSVRef} headers={["pick", "accept", "decline"]} data={downloadData} filename={`picklist-${currentEvent}.csv`}/>

            <input ref={uploadCSVRef} className={"hide-csv-upload"} type={"file"} accept={".csv"} onChange={handleFileUpload}/>

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
                                setTaken={(val) => item.team.taken = val}
                                itemIndex={pickList.indexOf(item)}
                                accept={false}
                                decline={false}
                                addSelfToStats={addTeamToStatsList}
                                statsListLength={teamStatsList.length}
                                isBlacklisted={blackList.filter(e => e.number === item.team.number).length > 0}
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
                                setTaken={(val) => item.team.taken = val}
                                itemIndex={acceptList.indexOf(item)}
                                accept={true}
                                decline={false}
                                statsListLength={teamStatsList.length}
                                addSelfToStats={addTeamToStatsList}
                                isBlacklisted={blackList.filter(e => e.number === item.team.number).length > 0}
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
                                setTaken={(val) => {
                                    item.team.taken = val
                                }}
                                itemIndex={declineList.indexOf(item)}
                                accept={false}
                                decline={true}
                                statsListLength={teamStatsList.length}
                                addSelfToStats={addTeamToStatsList}
                                isBlacklisted={blackList.filter(e => e.number === item.team.number).length > 0}
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
                <Button color={"green"} onClick={() => {
                    uploadCSVRef.current.click()
                    setImportConfirmationActive(false)
                }}>Yes, I'm Sure</Button>
            </Dimmer>

            <Dimmer page active={resetToEventRankingsCofnirmationActive} onClickOutside={() => {setResetToEventTrankingsConfirmationActive(false)}}>
                <Header inverted>
                    This will overwrite your current picklist with the event rankings. Are you sure you want to continue?
                </Header>
                <Button color={"green"} onClick={() => {
                    resetToEventRankings()
                    setResetToEventTrankingsConfirmationActive(false)
                }}>Yes, I'm Sure</Button>
            </Dimmer>

        </div>
    )
}

function ItemDisplay(props: {item:ItemType, setTaken:(val:boolean) => void, itemIndex:number, accept:boolean, decline:boolean, statsListLength:number, addSelfToStats:(team:Team) => void, isBlacklisted:boolean}) {

    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")
    let year = currentEvent.substring(0, 4)

    let [imageInAPI, setImageInAPI] = useState(false)

    useEffect(() => {
        doesTeamHaveImage(props.item.team.number, year).then((result) => {setImageInAPI(result)});
    }, [props.item.team.number]);


    const [imgSrc, setImgSrc] = useState("");

    const [comments, setCommants] = useLocalStorage(COMMENTS(props.item.team.number.toString(), year), "")

    useEffect(() => {
            if(imageInAPI) {
                getImage(props.item.team.number, year).then(r => {setImgSrc(r)});
            }
        }, [imageInAPI]);

    return(
        <div className={"picklist-item-display " + (props.accept ? " accept " : "") + (props.decline ? " decline " : "") + (props.item.team.taken ? " crossed-off-item " : "") }>
            <div className={"picklist-item-flex"}>
                <Icon name={"list"} size={"large"}/>

                <Checkbox
                    className={"picklist-check"}
                    checked={props.item.team.taken}
                    onChange={(e, data) => props.setTaken(data.checked!)}
                />

                <div className={"picklist-item-content"}>
                    <h2 className={"picklist-text"}>
                        <TeamLink number={props.item.team.number} displayText={`${props.itemIndex + 1}. ${props.item.team.number} - ${props.item.team.name}`}/>
                    </h2>
                    <div>
                        {props.isBlacklisted ?
                            <Popup
                                content={"This team is blacklisted from being scouted!"}
                                trigger={
                                    <Icon name={"list"} circular inverted color={"black"}/>
                                }
                            />
                            : <div/>
                        }

                        <Popup
                            content={
                                <TextArea
                                    value={comments}
                                    onChange={(e, data) => setCommants(data.value as string)}
                                    placeholder={`Coments on ${props.item.team.number}...`}
                                    style={{width: "25vw"}}
                                />
                            }
                            on={"click"}
                            trigger={
                                <Button icon={"comment alternate"} color={"purple"} size={"small"}/>
                            }
                        />

                        <Popup
                            content={
                                 <img className={`team-display-image radius-image`}
                                      src={imgSrc} alt={props.item.team.number.toString()}/>
                            }                                
                            on={"click"}
                            trigger={
                                <Button icon={"image"} color={"blue"} size={"small"} disabled={!imageInAPI}/>
                            }
                        />

                        <Button icon={"info"} color={"grey"} size={"small"} disabled={props.statsListLength >= 4} onClick={() => {
                            props.addSelfToStats(props.item.team)
                        }}/>
                    </div>

                    <div className={"picklist-item-crossoff " + (props.item.team.taken ? "crossed-off" : "") }/>
                </div>
            </div>
        </div>
    )
}

export default PicklistPage;