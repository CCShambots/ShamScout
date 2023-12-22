import React, {useEffect, useRef, useState} from "react";
import AppHeader from "../components/header/AppHeader";
import {Button, Dimmer, Icon, Input, Popup, Table} from "semantic-ui-react";
import {useLocalStorage} from "usehooks-ts";
import "./TeamsPage.css"
import TeamPreviewDisplay from "../components/teams/TeamPreviewDisplay";
import {Pull} from "../util/APIUtil";
import {ScoutForm} from "../components/ScoutForm";
import TeamListDisplay from "../components/teams/TeamListDisplay";
import PhotoAssignment from "../components/teams/PhotoAssignment";
import {Link} from "react-router-dom";

export type team = {
    number:number,
    name:string
}

function TeamsPage() {

    let [currentEvent] = useLocalStorage("current-event", "");
    let [currentTemplate] = useLocalStorage("active-template", "")

    let [listView, setListView] = useLocalStorage("teams-list-view", false)
    let [teams] = useLocalStorage<team[]>(`teams-${currentEvent}`, []);
    let [teamsWithPhotos, setTeamsWithPhotos] = useState<number[]>([])
    let [teamsWithOldPhotos, setTeamsWithOldPhotos] = useState<number[]>([])

    let [submittedForms, setSubmittedForms] = useState<ScoutForm[]>([])

    let [qrDimmerActive, setQRDimmerActive] = useState(false)

    let [lookupTeam, setLookupTeam] = useState("")
    let linkRef = useRef<HTMLAnchorElement>(null)

    useEffect(() => {

        Pull(`forms/get/template/${currentTemplate}`, (data) => {
            setSubmittedForms(data.map((e:any) =>
                ScoutForm.fromJson(e[0])
            ))
        }).then(() => {})
    }, [currentEvent])

    useEffect(() => {

        //TODO: Implement old photos when Aiden has photo timing
        setTeamsWithOldPhotos(teams.map(e => e.number))
    }, [teams]);

    useEffect(() => {
        console.log(teamsWithPhotos.length)
    }, [teamsWithPhotos]);


    return(
        <div>
            <AppHeader/>

            <div className={"page"}>
                <div className={"top-row-info"}>
                    <div>
                        <Input
                            icon={"users"}
                            iconPosition={"left"}
                            placeholder={"Team Lookup"}
                            onChange={(e) => {
                                if(parseInt(e.target.value)) {
                                    setLookupTeam(e.target.value)
                                }
                            }}
                            onKeyDown={(e:any) => {
                                if(e.key === "Enter") {
                                    if(linkRef.current) {
                                        linkRef.current.click()
                                    }
                                }
                            }}
                        />
                        <Button icon={"arrow right"} color={"blue"}
                               disabled={isNaN(parseInt(lookupTeam))} onClick={() => {
                            if(linkRef.current) {
                                linkRef.current.click()
                            }
                        }}></Button>
                        <Link to={`/team?number=${lookupTeam}`} ref={linkRef}/>
                    </div>
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
                            teams.map(e => <TeamPreviewDisplay
                                key={e.number}
                                teamName={e.name}
                                teamNum={e.number}
                                setTeamNumber={(val) => {
                                    teamsWithPhotos.push(val)
                                    setTeamsWithPhotos([...teamsWithPhotos])
                                }}
                            />)
                        }
                    </div>
                }
                <hr/>
                <hr/>
                <hr/>
                <hr/>
                <hr/>
                <hr/>
                <hr/>
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
                <PhotoAssignment
                    allTeams={teams.map(e => e.number)}
                    teamsWithoutPhotos={teams.map(e => e.number).filter(e => !teamsWithPhotos.includes(e))}
                    teamsWithOldPhotos={teamsWithOldPhotos}
                    setQRDimmerActive={(val) => {setQRDimmerActive(val)}}
                />
            </Dimmer>
        </div>
    )
}

export default TeamsPage

