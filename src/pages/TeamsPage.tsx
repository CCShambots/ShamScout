import React, {useEffect, useState} from "react";
import AppHeader from "../components/header/AppHeader";
import {Button, Dimmer, Header, Icon, Input, Popup, Table} from "semantic-ui-react";
import {useLocalStorage} from "usehooks-ts";
import "./TeamsPage.css"
import TeamPreviewDisplay from "../components/teams/TeamPreviewDisplay";
import {Pull} from "../util/APIUtil";
import {ScoutForm} from "../components/ScoutForm";
import TeamListDisplay from "../components/teams/TeamListDisplay";
import QRCode from "react-qr-code";

type team = {
    number:number,
    name:string
}

function TeamsPage() {

    let [currentEvent] = useLocalStorage("current-event", "");
    let [currentTemplate] = useLocalStorage("active-template", "")

    let [listView, setListView] = useLocalStorage("teams-list-view", false)
    let [teams] = useLocalStorage<team[]>(`teams-${currentEvent}`, []);

    let [submittedForms, setSubmittedForms] = useState<ScoutForm[]>([])

    let [qrDimmerActive, setQRDimmerActive] = useState(false)

    let [numPitScouters, setNumPitScouters] = useState(1)
    let [currentPitScout, setCurrentPitScout] = useState(0)

    let [pitScoutSchedules, setPitScoutSchedules] = useState<String[]>([])


    useEffect(() => {

        Pull(`templates/get/name/${currentTemplate}`, (data) => {
            setSubmittedForms(data.map((e:any) =>
                ScoutForm.fromJson(e)
            ))
        }).then(() => {})
    }, [currentEvent])

    useEffect(() => {
        let pitScoutArray:String[]= Array(numPitScouters).fill("")
        
        let index = 0;
        
        teams.forEach(e => {
            let num = e.number
            pitScoutArray[index] += `${num},`

            index = index < pitScoutArray.length-1 ? index+1 : 0
        })

        let shortenedArray =pitScoutArray.map(e => e.substring(0, e.length-1))

        setPitScoutSchedules(shortenedArray)
        
    }, [numPitScouters, teams]);

    return(
        <div>
            <AppHeader/>

            <div className={"page"}>
                <div className={"top-row-info"}>
                    <h1 className={"teams-title"}>Teams</h1>
                    <Button.Group size={"huge"}>
                        <Button animated={"vertical"} onClick={() => setListView(true)} active={listView}>
                            <Button.Content hidden>List</Button.Content>
                            <Button.Content visible><Icon name={"list"}/></Button.Content>
                        </Button>
                        <Button animated={"vertical"} onClick={() => setListView(false)} active={!listView}>
                            <Button.Content hidden>Grid</Button.Content>
                            <Button.Content visible><Icon name={"grid layout"}/></Button.Content>
                        </Button>
                    </Button.Group>
                </div>
                {
                    listView ?
                        <div className={"main-teams-display-list"}>
                            <Table>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.Cell>Number</Table.Cell>
                                        <Table.Cell>Name</Table.Cell>
                                        <Table.Cell>Forms on Record</Table.Cell>
                                        <Table.Cell>Forms for this Event</Table.Cell>
                                    </Table.Row>

                                    {
                                        teams.map(e => <TeamListDisplay key={e.number} teamNum={e.number} teamName={e.name} submittedForms={submittedForms}/>)
                                    }
                                </Table.Header>
                            </Table>
                        </div>
                    : <div className={"main-teams-display-grid"}>
                        {
                            teams.map(e => <TeamPreviewDisplay key={e.number} teamName={e.name} teamNum={e.number}/>)
                        }
                    </div>
                }
            </div>

            <div className={"primary-action-buttons"}>
                <Popup content={"Show schedule QR Code"} size={"large"} inverted trigger={
                    <Button
                        size={"massive"} icon={"qrcode"} color={"blue"}
                        onClick={() => setQRDimmerActive(true)}
                    />
                }/>
            </div>

            <Dimmer page active={qrDimmerActive} onClickOutside={() => setQRDimmerActive(false)}>
                <div className={"config-qr-code-window"}>

                    <div className={"qr-code-header"}>
                        <h1 className={"config-qr-code-header-text"}>Team Photo QR Code</h1>
                        <Button className={"qr-code-close-button"} icon={"close"} onClick={() => setQRDimmerActive(false)}>
                        </Button>
                    </div>

                    <div className={"inline-input"}>
                        <div className={"input-text-container"}>
                            <h3 className={"input-text"}>Number of Pit Scouters</h3>
                        </div>
                        <Input
                            value={numPitScouters}
                            onChange={(event) => {
                                let result = parseInt(event.target.value)
                                if(result && result < teams.length) {
                                    setNumPitScouters(parseInt(event.target.value))
                                } else if (event.target.value === "") {
                                    setNumPitScouters(0);
                                }
                            }
                        }/>
                    </div>

                    <br/>
                    <QRCode value={`pho:${pitScoutSchedules[currentPitScout]}`}/>

                    <div className={"inline-arrows"}>
                        <Button icon={"arrow left"} onClick={() => {
                            if(currentPitScout > 0) {
                                setCurrentPitScout(currentPitScout-1)
                            }
                        }}/>
                        <h3>{currentPitScout+1} of {numPitScouters}</h3>
                        <Button icon={"arrow right"} onClick={() => {
                            if(currentPitScout < numPitScouters-1) {
                                setCurrentPitScout(currentPitScout+1)
                            }
                        }}/>
                    </div>
                </div>
            </Dimmer>
        </div>
    )
}

export default TeamsPage

