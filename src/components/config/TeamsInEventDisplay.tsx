import React, {useEffect, useState} from "react";
import {PullTBA} from "../../util/APIUtil";
import {useLocalStorage} from "usehooks-ts";
import {Button, Dimmer, Icon, Input, Table} from "semantic-ui-react";
import TeamLink from "../team-link/TeamLink";


type TeamInfo = {
    "number":number,
    "name":string
}

function TeamsInEventDisplay() {

    let [event] = useLocalStorage("current-event", "");
    let [TBAKey] = useLocalStorage("tba-key", "");

    let [teams, setTeams] = useLocalStorage<TeamInfo[]>(`teams-${event}`, [])
    //Whether we've made customizations to the event so that it can save across reloads
    let [teamOverride, setTeamOverride] = useLocalStorage(`team-override-${event}`, false)
    let [addTeamDimmerActive, setAddTeamDimmerActive] = useState(false)

    let [addNumber, setAddNumber] = useState(0);
    let [addName, setAddName] = useState("");

    const addTeam = () => {
        if(addName !== "" && addNumber !== 0) {
            teams.push({name: addName, number: addNumber})

            setAddName("")
            setAddNumber(0)

            setTeamOverride(true)

            teams.sort((e1, e2) => e1.number-e2.number)

            setTeams([...teams])
        }
    }

    const syncTeamsInEvent = () => {

        if(!teamOverride) {
            let startingEvent = event
            let startingTBAKey = TBAKey;

            PullTBA(`event/${event}/teams/simple`, (data) => {
                let newTeams:TeamInfo[] = []

                data.forEach((e:any) => {
                    newTeams.push({number: parseInt(e.key.substring(3)), name: e.nickname})
                })

                newTeams.sort((e1, e2) => e1.number-e2.number)

                if(startingEvent === event && startingTBAKey === TBAKey && newTeams.length > 0) {
                    setTeams(newTeams)
                }
            })
        }
    }

    useEffect(() => {
        syncTeamsInEvent()
    }, [event, TBAKey])

    return (
        <div onKeyDown={(e) => {
            if(e.key === "Enter" && addTeamDimmerActive) addTeam()
            else if(e.key ==="Escape" && addTeamDimmerActive) setAddTeamDimmerActive(false)
        }}
        >
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Number</Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>
                            <Button animated={"vertical"} onClick={() => setAddTeamDimmerActive(true)}>
                                <Button.Content hidden>Create</Button.Content>
                                <Button.Content visible><Icon name={"add"}/> </Button.Content>
                            </Button>

                            <Button animated={"vertical"} onClick={() => {
                                setTeamOverride(false)
                                syncTeamsInEvent()
                                }}>
                                <Button.Content hidden>Sync</Button.Content>
                                <Button.Content visible><Icon name={"sync"}/> </Button.Content>
                            </Button>
                        </Table.HeaderCell>
                    </Table.Row>

                    {
                        teams.map(e =>
                            <Table.Row key={e.number}>
                                <Table.Cell><TeamLink number={e.number} displayText={e.number}/></Table.Cell>
                                <Table.Cell><TeamLink number={e.number} displayText={e.name}/></Table.Cell>
                                <Table.Cell>
                                    <Button
                                        color={"red"}
                                        icon={"trash alternate"}
                                        onClick={() => setTeams(teams.filter(ele => ele !== e))}
                                    />
                                </Table.Cell>
                            </Table.Row>
                        )
                    }
                </Table.Header>
            </Table>

            <Dimmer page active={addTeamDimmerActive} onClickOutside={() => setAddTeamDimmerActive(false)}>
                <h1>Create New Team</h1>

                <Input
                    placeholder={"Number"}
                    value={addNumber}
                    onChange={(e) => setAddNumber(parseInt(e.target.value))}
                    //Require number input
                    onKeyPress={(event:any) => {
                        if (!/[0-9]/.test(event.key)) {
                            event.preventDefault();
                        }
                    }}/>
                <Input placeholder={"Name"} value={addName} onChange={(e) => setAddName(e.target.value)}/>

                <Button.Group>
                    <Button color={"blue"} onClick={() => {
                        setAddTeamDimmerActive(false)
                        addTeam()
                    }}>Create and Exit</Button>
                    <Button.Or/>
                    <Button color={"green"} onClick={() => {
                        addTeam()
                    }}>Create</Button>
                    <Button.Or/>
                    <Button color={"red"} onClick={() => setAddTeamDimmerActive(false)}>Cancel</Button>
                </Button.Group>
            </Dimmer>
        </div>
    )
}

export default TeamsInEventDisplay;