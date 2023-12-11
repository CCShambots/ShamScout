import React, {useEffect, useState} from "react";
import {Schedule, Scouter} from "../matchDisplay/ScheduleData";
import "./ScouterDisplay.css"
import {Button, Dimmer, Grid, Icon, Input, Popup, Progress} from "semantic-ui-react";
import {HexColorPicker} from "react-colorful";

type displayOptions = {
    schedule:Schedule,
    setSchedule:(e:Schedule) => void
}

function ScouterDisplay({schedule, setSchedule}: displayOptions) {

    let [names, setNames] = useState(schedule.scouters.map(e => e.name))

    let [adding, setAdding] = useState("")
    let [newColor, setNewColor] = useState("#aabbcc")

    let [dimmerActive, setDimmerActive] = useState(false)

    useEffect(() => {setNewColor(schedule.getNextColor())}, [adding, schedule])

    useEffect(() => {setNames(schedule.scouters.map(e => e.name))}, [schedule])

    let handleCreationClick = () => {
        if(names.map(e => e.toLowerCase()).indexOf(adding.toLowerCase())  === -1) {
            let newSchedule = schedule.createScouter(adding, newColor)
            setSchedule(newSchedule)

            setNames(newSchedule.scouters.map(e => e.name))

            setAdding("")
        }
        //Only add to the scouter list if the current entry is not in the list of names

    }

    return(
        <div className={"scouter-container"} onKeyDown={(e) => {
            if(e.key === "Enter" && dimmerActive) handleCreationClick()
            else if(e.key ==="Escape" && dimmerActive) setDimmerActive(false)
        }}
        >
            <div className={"scouter-header"}>
                <h1>Scouters ({schedule.scouters.length})</h1>
                <Button animated={"vertical"} onClick={() => {
                    setDimmerActive(true)
                    setNewColor(schedule.getNextColor())
                }}>
                    <Button.Content visible><Icon name={"add"}/></Button.Content>
                    <Button.Content hidden>Create</Button.Content>
                </Button>

                <Dimmer page active={dimmerActive} onClickOutside={() => setDimmerActive(false)}>
                    <div className={"create-scout-dimmer"}>
                        <h1>Create new Scouter</h1>

                        <Input
                            placeholder={"Enter new Scout Name..."}
                            value={adding}
                            onChange={(e) => setAdding(e.target.value)}
                            error={names.indexOf(adding) !== -1 && adding !== ""}
                        />

                        <hr/>

                        <HexColorPicker
                            color={newColor}
                            onChange={setNewColor}
                        />

                        <hr/>

                        <Button.Group>
                            <Button primary onClick={() => {
                                handleCreationClick()
                                setDimmerActive(false)
                            }}>Create and Close</Button>
                            <Button.Or></Button.Or>
                            <Button color={"green"} onClick={handleCreationClick}>Create</Button>
                            <Button.Or></Button.Or>
                            <Button color={"red"} onClick={() => setDimmerActive(false)}>Cancel</Button>
                        </Button.Group>
                    </div>
                </Dimmer>

            </div>
            <Grid columns={3}>
                {
                    names.map(n => {
                            let scouter = schedule.scouters.filter(e => e.name === n)[0];
                            return  <ScouterEntry
                                    e={scouter} key={n}
                                  numScheduled={schedule.getNumMatchesForScout(scouter)}
                                  targetNumScheduled={Math.round(schedule.totalMatchesToScout() / names.length)}
                                  removeSelf={() => {
                                    if(schedule.scouters.length>1) {
                                        setSchedule(schedule.removeScouter(n))
                                        setNames(names.filter(e => e !== n))
                                    }
                                }}
                                setSchedule={setSchedule}
                                schedule={schedule}
                            />
                        }
                    )
                }
            </Grid>

        </div>
    )
}

type EntryOptions = {
    e:Scouter,
    removeSelf:() => void,
    numScheduled:number,
    targetNumScheduled:number,
    setSchedule:(schedule:Schedule) => void,
    schedule:Schedule
}
function ScouterEntry({e, removeSelf, numScheduled, targetNumScheduled, setSchedule, schedule}:EntryOptions) {

    let [unavailableMatches, setUnavailableMatches] = useState("")

    return e ? <Grid.Row
        className={"scouter-entry-container"}
        style={{backgroundColor: e.color}} key={e.name}>

        <Grid.Column>
            {
                e.unavailableMatches.length > 0 ?
                <Popup trigger={<p className={"entry-text"}>{e.name}*</p>} content={`Unavailable in Matches ${e.getUnavailableString()}`}/> :
                <p className={"entry-text"}>{e.name}</p>

            }
        </Grid.Column>
        <Grid.Column>
            <Progress value={numScheduled} total={targetNumScheduled} progress={'value'} indicating style={{marginBottom: "1vh"}}/>

        </Grid.Column>

        <Grid.Column>
            <Button.Group>
                <Popup hoverable on={"click"}
                       onClose={() =>  {
                           e.parseUnavailableMatches(unavailableMatches)
                           setSchedule(Object.create(schedule))
                        }}
                       onOpen={() => setUnavailableMatches(e.getUnavailableString())}
                    content={
                        <div onKeyDown={(event) => {
                            if(event.key === "Enter") {
                                e.parseUnavailableMatches(unavailableMatches)
                                setSchedule(Object.create(schedule))
                            }
                        }}>
                            <p>Unavailable Matches</p>
                            <Input placeholder={"Matches..."} value={unavailableMatches}
                                   onChange={(e, data) => {setUnavailableMatches(data?.value)}}/>
                        </div>
                    }
                    trigger={
                    <Button icon={"setting"} primary/>
                    }
                />

                <Button icon={"minus"} color={"red"} onClick={removeSelf}/>
            </Button.Group>
        </Grid.Column>

    </Grid.Row> : <div/>
}

export default ScouterDisplay;