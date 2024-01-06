import React, {useEffect, useRef, useState} from "react";
import AppHeader from "../components/header/AppHeader";
import {Button, Dimmer, Icon, Input, Popup, Table} from "semantic-ui-react";
import {useLocalStorage} from "usehooks-ts";
import "./TeamsPage.css"
import TeamPreviewDisplay from "../components/teams/TeamPreviewDisplay";
import {doesTeamHaveImage, getAgeOfImage, getImagePath, Pull} from "../util/APIUtil";
import {ScoutForm} from "../components/ScoutForm";
import TeamListDisplay from "../components/teams/TeamListDisplay";
import PhotoAssignment from "../components/teams/PhotoAssignment";
import {Link} from "react-router-dom";
import {ACTIVE_TEMPLATE, CURRENT_EVENT, TEAMS, TEAMS_LIST_VIEW} from "../util/LocalStorageConstants";
import {bytesList, formsList, templateDetails} from "../util/APIConstants";

export type team = {
    number:number,
    name:string
}

function TeamsPage() {

    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "");
    let [activeTemplate] = useLocalStorage(ACTIVE_TEMPLATE, "")

    let year = currentEvent.substring(0, 4)

    let [listView, setListView] = useLocalStorage(TEAMS_LIST_VIEW, false)
    let [teams] = useLocalStorage<team[]>(TEAMS(currentEvent), []);
    let [teamsWithPhotos, setTeamsWithPhotos] = useState<number[]>([])
    let [teamsWithOldPhotos, setTeamsWithOldPhotos] = useState<number[]>([])

    let [submittedForms, setSubmittedForms] = useState<ScoutForm[]>([])

    let [qrDimmerActive, setQRDimmerActive] = useState(false)

    let [lookupTeam, setLookupTeam] = useState("")
    let linkRef = useRef<HTMLAnchorElement>(null)

    let [savedImages, setSavedImages] = useState<string[]>([])

    useEffect(() => {
        Pull(bytesList, (data) => {
            setSavedImages(data as string[])
        })
    }, []);

    useEffect(() => {

        Pull(formsList(activeTemplate), (data) => {
            setSubmittedForms(data.map((e:any) =>
                ScoutForm.fromJson(e)
            ))
        }).then(() => {})
    }, [currentEvent])

    let loadOldPhotos = async () => {
        const results = await Promise.all(teams.map(async (e) => {
            if(!savedImages.includes(`${e.number}-img-${year}`)) return ({old: false, number: e.number})
            let age = await getAgeOfImage(e.number, year)

            return {old: age > 5, number: e.number}
        }))

        let olds = results.filter(e => e.old).map(e => e.number)

        setTeamsWithOldPhotos(olds)
    }

    useEffect(() => {
        loadOldPhotos().then(() => {})

    }, [teams, savedImages, loadOldPhotos]);


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
                                teamsInAPI={savedImages}
                                key={e.number}
                                teamName={e.name}
                                teamNum={e.number}
                                isOldTeamImage={teamsWithOldPhotos.includes(e.number)}
                                setTeamNumber={(val) => {
                                    teamsWithPhotos.push(val)
                                    setTeamsWithPhotos([...teamsWithPhotos])
                                }}
                            />)
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
                <PhotoAssignment
                    allTeams={teams.map(e => e.number)}
                    teamsWithoutPhotos={teams.map(e => e.number).filter(e => !teamsWithPhotos.includes(e))}
                    teamsWithOldPhotos={[teamsWithOldPhotos, teams.map(e => e.number).filter(e => !teamsWithPhotos.includes(e))].flat()}
                    setQRDimmerActive={(val) => {setQRDimmerActive(val)}}
                />
            </Dimmer>
        </div>
    )
}

export default TeamsPage

