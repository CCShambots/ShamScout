import React, {useEffect, useState} from "react";
import AppHeader from "../components/header/AppHeader";
import {Button, Dimmer, Input, Popup, Table} from "semantic-ui-react";
import {Pull, PullTBA} from "../util/APIUtil";
import {useLocalStorage} from "usehooks-ts";
import "./MatchPage.css"
import {Link} from "react-router-dom";
import {ScoutForm} from "../components/ScoutForm";
import Match from "../components/scheduling/matchDisplay/Match";
import {QRDisplay, splitString} from "../util/QRUtil";
import {ACTIVE_TEMPLATE, CURRENT_EVENT, MATCHES} from "../util/LocalStorageConstants";

function MatchPage() {
    
    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")
    let [currentTemplate] = useLocalStorage(ACTIVE_TEMPLATE, "")
    
    let [matches, setMatches] = useLocalStorage<Match[]>(MATCHES(currentEvent), [])
    let [submittedForms, setSubmittedForms] = useState<ScoutForm[]>([])

    let [qrDimmerActive, setQRDimmerActive] = useState(false)

    let [manualMatchesActive, setManualMatchesActive] = useState(false)
    
    const syncMatches = () => PullTBA(`event/${currentEvent}/matches/simple`, (data) => {
        setMatches(data.filter((e:any) => e.key.indexOf(currentEvent+"_qm") !== -1).map((e:any):Match => {

            let redAllianceKeys = e.alliances.red.team_keys;
            let blueAllianceKeys = e.alliances.blue.team_keys;

            let redAllianceNumbers = redAllianceKeys.map((e:any) => parseInt(e.substring(3)));
            let blueAllianceNumbers = blueAllianceKeys.map((e:any) => parseInt(e.substring(3)));

            return new Match(parseInt(e.key.substring(e.key.lastIndexOf("_qm")+3)), redAllianceNumbers, blueAllianceNumbers)
        }).sort((e1:Match, e2:Match) => e1.match_number-e2.match_number))

        window.location.reload()
    })

    useEffect(() => {

        Pull(`forms/get/template/${currentTemplate}?event=${currentEvent}`, (data) => {

            console.log(data)
            setSubmittedForms(data.map((e:any) =>
                ScoutForm.fromJson(e[0])
            ))
        }).then(() => {})
    }, [matches, currentEvent])

    function createNewMatch() {
        matches.push(new Match(matches.length+1, [0,0,0], [0,0,0]))
        setMatches(matches)
    }

    return(
        <div>
            <AppHeader/>

            <div className={"match-table"}>

                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Match</Table.HeaderCell>
                            <Table.HeaderCell>Red 1</Table.HeaderCell>
                            <Table.HeaderCell>Red 2</Table.HeaderCell>
                            <Table.HeaderCell>Red 3</Table.HeaderCell>
                            <Table.HeaderCell>Blue 1</Table.HeaderCell>
                            <Table.HeaderCell>Blue 2</Table.HeaderCell>
                            <Table.HeaderCell>Blue 3</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {matches.map(e =>
                        <Table.Row className={"match-display"} key={e.match_number}>
                            <Table.Cell>Quals {e.match_number}</Table.Cell>
                            <TeamDisplay match={e.match_number} teamNum={e.red1} redAlliance={true} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match_number} teamNum={e.red2} redAlliance={true} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match_number} teamNum={e.red3} redAlliance={true} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match_number} teamNum={e.blue1} redAlliance={false} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match_number} teamNum={e.blue2} redAlliance={false} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match_number} teamNum={e.blue3} redAlliance={false} submittedForms={submittedForms}/>
                        </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </div>

            <div className={"primary-action-buttons"}>
                <Popup content={"Show schedule QR Code"} size={"large"} inverted trigger={
                   <Button
                       size={"massive"} icon={"qrcode"} color={"blue"}
                       onClick={() => setQRDimmerActive(true)}
                   />
                }/>

                <Popup content={"Sync matches from TBA"} size={"large"} inverted trigger={
                    <Button
                        size={"massive"} icon={"sync"} color={"green"}
                        onClick={syncMatches}
                    />
                }/>

            </div>

            <div className={"manual-config-button"}>
                <Popup content={"Manually set matches"} size={"large"} inverted trigger={
                    <Button
                        size={"huge"} icon={"setting"} color={"red"}
                        onClick={() => {setManualMatchesActive(true)}}
                    />
                }

                />
            </div>

            <Dimmer page active={qrDimmerActive} onClickOutside={() => setQRDimmerActive(false)}>
                <div className={"config-qr-code-window"}>

                    <div className={"qr-code-header"}>
                        <h1 className={"config-qr-code-header-text"}>Match Schedule QR Code</h1>
                        <Button className={"qr-code-close-button"} icon={"close"} onClick={() => setQRDimmerActive(false)}>
                        </Button>
                    </div>

                    <QRDisplay splitCode={splitString(Match.toCode(matches), 500)}/>
                </div>
            </Dimmer>

            <Dimmer page active={manualMatchesActive} onClickOutside={() => setManualMatchesActive(false)}>
                <div className={"manual-match-window"}>
                    <h1>Manually enter a list of matches</h1>

                    <div className={"match-table-manager"}>
                        <div/>
                        <Table>
                            <Table.Header>
                                <Table.HeaderCell>Match</Table.HeaderCell>
                                <Table.HeaderCell>Red 1</Table.HeaderCell>
                                <Table.HeaderCell>Red 2</Table.HeaderCell>
                                <Table.HeaderCell>Red 3</Table.HeaderCell>
                                <Table.HeaderCell>Blue 1</Table.HeaderCell>
                                <Table.HeaderCell>Blue 2</Table.HeaderCell>
                                <Table.HeaderCell>Blue 3</Table.HeaderCell>
                            </Table.Header>
                            {
                                matches.map((e) =>
                                    <Table.Row>
                                        <Table.Cell>{e.match_number}</Table.Cell>
                                        <Table.Cell>
                                            <Input
                                                value={e.red1}
                                                onChange={(event) => {
                                                    let num = parseInt(event.target.value);

                                                    if(num) {
                                                        e.red1 = num
                                                    } else if(event.target.value === "") {
                                                        e.red1 = 0
                                                    }
                                                    setMatches([...matches])
                                                }}
                                            />
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Input
                                                value={e.red2}
                                                onChange={(event) => {
                                                    let num = parseInt(event.target.value);

                                                    if(num) {
                                                        e.red2 = num
                                                    } else if(event.target.value === "") {
                                                        e.red2 = 0
                                                    }
                                                    setMatches([...matches])
                                                }}
                                            />
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Input
                                                value={e.red3}
                                                onChange={(event) => {
                                                    let num = parseInt(event.target.value);

                                                    if(num) {
                                                        e.red3 = num
                                                    } else if(event.target.value === "") {
                                                        e.red3 = 0
                                                    }
                                                    setMatches([...matches])
                                                }}
                                            />
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Input
                                                value={e.blue1}
                                                onChange={(event) => {
                                                    let num = parseInt(event.target.value);

                                                    if(num) {
                                                        e.blue1 = num
                                                    } else if(event.target.value === "") {
                                                        e.blue1 = 0
                                                    }
                                                    setMatches([...matches])
                                                }}
                                            />
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Input
                                                value={e.blue2}
                                                onChange={(event) => {
                                                    let num = parseInt(event.target.value);

                                                    if(num) {
                                                        e.blue2 = num
                                                    } else if(event.target.value === "") {
                                                        e.blue2 = 0
                                                    }
                                                    setMatches([...matches])
                                                }}
                                            />
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Input
                                                value={e.blue3}
                                                onChange={(event) => {
                                                    let num = parseInt(event.target.value);

                                                    if(num) {
                                                        e.blue3 = num
                                                    } else if(event.target.value === "") {
                                                        e.blue3 = 0
                                                    }
                                                    setMatches([...matches])
                                                }}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                )
                            }
                        </Table>
                        <div/>
                    </div>

                    <Button color={"green"} onFocus={() => {
                        createNewMatch()
                    }} onClick={() => {
                        createNewMatch()
                    }}>Create New Match</Button>
                    <Button color={"red"} onClick={() => {
                        setMatches([...matches.slice(0, matches.length-1)])
                    }}>Remove Last Match</Button>
                </div>
            </Dimmer>

        </div>
    )
}

function TeamDisplay(props: {teamNum:number, match:number, redAlliance:boolean, submittedForms:ScoutForm[]}) {

    let thisTeamForms = props.submittedForms
        .filter(e => e.team === props.teamNum && e.match_number === props.match)

    let isMissing = ScoutForm.isMissing(props.teamNum, props.match, props.submittedForms);

    return(
        <Table.Cell className={(props.redAlliance ? "red-team " : "blue-team ") + (isMissing ? "error-team" : "")}>
            <Link to={`/team?number=${props.teamNum}`}>
                <Popup
                    header="Forms"
                    content={ScoutForm.getDisplayNameForPopup(thisTeamForms)}
                    trigger={<p className={"team-link"}>{props.teamNum} {thisTeamForms.length > 0 ? `(${thisTeamForms.length})` : ""}</p>}
                    inverted
                />
            </Link>
        </Table.Cell>
    )
}

export default MatchPage

