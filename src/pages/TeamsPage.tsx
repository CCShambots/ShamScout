import React, {useEffect, useState} from "react";
import Header from "../components/header/Header";
import {Button, Icon, Table} from "semantic-ui-react";
import {useLocalStorage} from "usehooks-ts";
import "./TeamsPage.css"
import TeamPreviewDisplay from "../components/teams/TeamPreviewDisplay";
import {Pull, PullTBA} from "../util/APIUtil";
import GenericForm from "../components/GenericForm";
import TeamListDisplay from "../components/teams/TeamListDisplay";

type team = {
    num:number,
    name:string
}

function TeamsPage() {

    let [currentEvent] = useLocalStorage("current-event", "");

    let [listView, setListView] = useLocalStorage("teams-list-view", false)
    let [teams, setTeams] = useState<team[]>([]);

    let [submittedForms, setSubmittedForms] = useState<GenericForm[]>([])

    useEffect(() => {
        PullTBA(`event/${currentEvent}/teams/simple`, (data) => {
            let newTeams:team[] = []

            data.forEach((e:any) => {
                newTeams.push({num: parseInt(e.key.substring(3)), name: e.nickname})
            })

            newTeams.sort((e1, e2) => e1.num-e2.num)

            setTeams([...newTeams])
        })
    }, [currentEvent])

    useEffect(() => {

        Pull(`template/test/get`, (data) => {
            setSubmittedForms(data.map((e:any) =>
                GenericForm.fromJson(e)
            ))
        }).then(() => {})
    }, [currentEvent])

    return(
        <div>
            <Header/>

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
                                        teams.map(e => <TeamListDisplay key={e.num} teamNum={e.num} teamName={e.name} submittedForms={submittedForms}/>)
                                    }
                                </Table.Header>
                            </Table>
                        </div>
                    : <div className={"main-teams-display-grid"}>
                        {
                            teams.map(e => <TeamPreviewDisplay key={e.num} teamName={e.name} teamNum={e.num}/>)
                        }
                    </div>
                }
            </div>
        </div>
    )
}

export default TeamsPage

