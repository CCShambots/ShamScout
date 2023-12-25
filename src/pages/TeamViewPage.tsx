import React, {createRef, useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {useLocalStorage} from "usehooks-ts";
import Picture from "../resources/team_placeholder.png";
import "./TeamViewPage.css"
import {Field, ScoutForm} from "../components/ScoutForm";
import {doesTeamHaveImage, EditForm, getImagePath, Pull, PullTBA, RemoveForm, RemoveImage} from "../util/APIUtil";
import {Button, Dimmer, Dropdown, FormField, Header, Icon, Popup, Table} from "semantic-ui-react";
import packageJson from '../../package.json';
import Banner from "../components/teams/Banner";
import { CSVLink } from "react-csv";
import {FormTemplate} from "../components/config/FormTemplate";
import AppHeader from "../components/header/AppHeader";
import {ACTIVE_TEMPLATE, CURRENT_EVENT, TEAMS} from "../util/LocalStorageConstants";

export type Team = {
    number:number,
    name:string
}

function TeamViewPage() {

    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")

    let [activeTemplate] = useLocalStorage(ACTIVE_TEMPLATE, "")

    let [teams] = useLocalStorage<Team[]>(TEAMS(currentEvent), []);

    const [searchParams] = useSearchParams();
    let teamNum= parseInt(searchParams.get("number") || "0")
    let [teamName, setTeamName] = useState("")

    let [, setSubmittedForms] = useState<ScoutForm[]>([])
    let [idMap, setIdMap] = useState<Map<string, string>>(new Map())

    let [thisTeamForms, setThisTeamForms] = useState<ScoutForm[]>([])
    let [thisEventForms, setThisEventForms] = useState<ScoutForm[]>([])

    let year=  packageJson.version.substring(0, 4);

    let [events, setEvents] = useState<TeamEventInfo[]>([])

    let [imageInAPI, setImageInAPI] = useState(false)

    let [removeImageDimmer, setRemoveImageDimmer] = useState(false)

    let [removeFormDimmer, setRemoveFormDimmer] = useState(false)
    let [removeFormID, setRemoveFormID] = useState("")

    let [eventsInFilter, setEventsInFilter] = useState<string[]>([])

    let [editDimmerActive, setEditDimmerActive] = useState(false)
    let [formToEdit, setFormToEdit] = useState<ScoutForm>(new ScoutForm("", -1, 0, "", []))

    let [editSuccessDimmerActive, setEditSuccessDimmerActive] = useState(false)
    let [editSuccess, setEditSuccess] = useState(false)

    let [clickedSubmitOnce, setClickedSubmitOnce] = useState(false)

    useEffect(() => {
        if(!editDimmerActive) {
            setClickedSubmitOnce(false)
        }
    }, [editDimmerActive]);

    const eventYear = currentEvent.substring(0, 4)

    useEffect(() => {
        doesTeamHaveImage(teamNum).then((result) => {setImageInAPI(result)});
    }, [teamNum]);

    let downloadCSVRef:any = createRef()

    //Load in all the data
    useEffect(() => {

        let orderOfItems:string[] = [];

        Pull(`templates/get/name/${activeTemplate}`, (data) => {
            let config:FormTemplate = FormTemplate.fromJson(data)

            orderOfItems = config.items.map((e) => e.label);
        })


        Pull(`forms/get/template/${activeTemplate}`, (data) => {

            let forms:ScoutForm[] = data.map((e:any) =>
                ScoutForm.fromJson(e[0])
            )

            for(let i = 0; i < forms.length; i++) {
                idMap.set(forms[i].toString(), data[i][1])
            }

            setIdMap(idMap)

            forms.sort((e1, e2) => e1.match_number - e2.match_number)

            forms.forEach((e) => {
                e.fields.sort((e1, e2) => orderOfItems.indexOf(e1.label) - orderOfItems.indexOf(e2.label))
            })

            setSubmittedForms(forms)

            let thisTeamForms = forms.filter((e) => e.team === teamNum)
            setThisTeamForms(thisTeamForms)

            let thisEventForms = thisTeamForms.filter((e) => e.event === currentEvent)
            setThisEventForms(thisEventForms)

        }).then(() => {})

        PullTBA(`team/frc${teamNum}/events/${year}/statuses`, async(data) => {

            let eventNames = new Map<string, string>()

            //Pull event names
            PullTBA(`team/frc${teamNum}/events/${year}/simple`, (dataInner) => {

                dataInner.forEach((e:any) => {
                    eventNames.set(e.key, parseEventName(e.name))
                })

                let eventKeys = Object.keys(data);
                let eventOutput = eventKeys.map(e =>{
                        return TeamEventInfo.fromJson(e, eventNames.get(e) ?? "Name Not Found", data[e])
                    }
                )

                setEvents(eventOutput)

            })

        })
    }, [currentEvent, teamNum])

    useEffect(() => {
        if(teams.filter(e => e.number === teamNum).length === 0) {
            PullTBA(
                `team/frc${teamNum}/simple`, (data) => {
                   setTeamName(data.nickname)
                }
            )
        } else {
            setTeamName(teams.filter(e => e.number === teamNum)[0].name)
        }
    }, [teamNum, teams])

    function parseEventName(rawName:string):string {
        let output = rawName

        if(rawName.indexOf("presented") !== -1) {
            //Remove any "presented by" stuff because it takes up too much text
            output = rawName.substring(0, rawName.indexOf("presented"))
            + (
                //If there was a "presented" removed and a dash for a division (i.e. FiM states, add that as well
                rawName.indexOf("presented") !== -1 && rawName.indexOf("-") !== -1 ?
                    rawName.substring(rawName.indexOf("-")) : ""
            )
        }

        //Add lines here to replace any bulky names like MSC, etc
        output = output.replace("FIRST in Michigan State Championship", "MSC")
        output = output.replace("FIRST In Texas District Championship", "TDC")

        return output
    }

    useEffect(() => {

    }, [thisTeamForms])

    return <div>
        <AppHeader/>

        <div className={"page"}>
            <div className={"top-row"}>
                <div className={"top-text"}>
                    <h1>{teamNum} - {teamName}</h1>
                    <h1>{TeamEventInfo.getSeasonRecordString(events)}</h1>
                    <h1>{thisTeamForms.length} Forms on Record</h1>
                    <h1>{thisEventForms.length} Forms for This Event</h1>
                </div>
                <div>
                    <h1 className={"result-text"}>Results</h1>
                    <EventTable events={events}/>
                </div>
                <div className={"banners"}>
                    {
                        events.filter(e => e.won).map(e => {
                            return <Banner key={e.eventKey} event={e.eventName}/>
                        })
                    }
                </div>
                <div className={"team-image-container"}>
                    {
                        imageInAPI ?
                        <img className={"team-view-pic"} src={getImagePath(teamNum, eventYear)} alt={teamNum.toString()}/> :
                        <img className={"team-view-pic"} src={Picture} alt={teamNum.toString()}/>
                    }
                    <Button color={"red"} disabled={!imageInAPI} onClick={() => {
                        setRemoveImageDimmer(true)
                    }}><Icon name={"erase"}/> Clear Image</Button>
                </div>
            </div>

            <div className={"table-manager"}>

                <Dropdown
                    placeholder={"Filter by Event"}
                    // fluid
                    multiple
                    selection
                    options={
                        Array.from(thisTeamForms.reduce( (acc, e) => {
                            acc.add(e.event)

                            return acc;
                        }, new Set<string>())).map(e => {
                            return {
                                key: e,
                                text: e,
                                value: e
                            }
                        })
                    }
                    onChange={(event, data) => {
                        if(data.value) {
                            setEventsInFilter(data.value as string[])
                        } else {
                            setEventsInFilter([])
                        }
                    }}

                />

                <Button size={"huge"} color={"blue"} onClick={() => downloadCSVRef.current.link.click()}><Icon name={"table"}/>Download CSV</Button>
            </div>
            <CSVLink ref={downloadCSVRef} data={thisTeamForms} headers={thisTeamForms[0]?.generateHeader()} filename={`${teamNum}-data.csv`}/>

            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Match</Table.HeaderCell>
                        <Table.HeaderCell>Event</Table.HeaderCell>
                        <Table.HeaderCell>Edit</Table.HeaderCell>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>Del.</Table.HeaderCell>
                        {thisTeamForms[0]?.fields.map(e =>
                            <Table.HeaderCell key={e.label}>{e.label}</Table.HeaderCell>
                        )}
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {thisTeamForms.filter(e => {
                        return eventsInFilter.length === 0 || eventsInFilter.indexOf(e.event) !== -1
                    }).map(e => {

                        return <Table.Row key={thisTeamForms.indexOf(e)}>
                            <Table.Cell>
                                <Popup
                                    content={`Scouted by: ${e.scouter}`}
                                    trigger={
                                        <p className={"non-selectable"}>{e.match_number}</p>
                                    }
                                />
                            </Table.Cell>
                            <Table.Cell>{e.event}</Table.Cell>
                            <Table.Cell>
                                <Icon name={"pencil"} color={"blue"} onClick={() => {
                                    setFormToEdit(e)
                                    setEditDimmerActive(true)
                                }}/>
                            </Table.Cell>
                            <Table.Cell>
                                <Popup
                                    content={"Copy ID to clipboard"}
                                    trigger={
                                        <Icon name={"copy outline"} color={"yellow"} onClick={() => {
                                            navigator.clipboard.writeText(idMap.get(e.toString()) ?? "NOT FOUND")
                                        }}/>
                                    }
                                />

                            </Table.Cell>
                            <Table.Cell>
                                <Popup
                                    content={"Remove this form (dangerous)"}
                                    trigger={
                                        <Icon color={"red"} name={"trash alternate"} onClick={() => {
                                          setRemoveFormID(idMap.get(e.toString()) ?? "NOT FOUND")
                                          setRemoveFormDimmer(true)
                                        }}/>
                                    }
                                />
                            </Table.Cell>
                            {
                                thisTeamForms[0]?.fields.map(field => {
                                    return e.fields.filter(ele => ele.label === field.label).map((ele) =>
                                        <Table.Cell key={ele.getValue().toString()}>{ele.getValue().toString()}</Table.Cell>
                                    )
                                })
                            }
                        </Table.Row>
                    }
                    )}
                </Table.Body>

                <Table.Footer fullWidth>
                    <Table.Row>
                        <Table.HeaderCell colSpan={'5'}>
                            <Header>
                                Averages
                            </Header>
                        </Table.HeaderCell>

                        {thisTeamForms[0]?.fields.map(field => {
                            let result =  thisTeamForms.filter(e => {
                                return eventsInFilter.length === 0 || eventsInFilter.indexOf(e.event) !== -1
                            }).map(e => e.fields.filter(ele => ele.label === field.label)[0]);

                            let [value, percent] = Field.takeAverage(result)

                            return <Table.HeaderCell>
                                {value !== -1 ? (percent ? value + "%" : value) : "N/A"}
                            </Table.HeaderCell>
                        })}

                    </Table.Row>
                </Table.Footer>
            </Table>
        </div>


        <Dimmer page active={removeImageDimmer} onClickOutside={() => setRemoveImageDimmer(false)}>
            <Header inverted>
                Are you sure you want to delete {teamNum}'s image?
            </Header>

            <Button size={"huge"} color={"red"} onClick={() => {
                setRemoveImageDimmer(false)
                RemoveImage(teamNum).then(() => {})
            }}>Yes, I'm sure</Button>
        </Dimmer>

        <Dimmer page active={removeFormDimmer} onClickOutside={() => setRemoveFormDimmer(false)}>
            <Header inverted>
                Are you sure you want to delete his form?
            </Header>

            <Button size={"huge"} color={"red"} onClick={() => {
                setRemoveFormDimmer(false)
                RemoveForm(activeTemplate, removeFormID).then(() => {})
                window.location.reload()
            }}>Yes, I'm sure</Button>
        </Dimmer>

        <Dimmer page active={editDimmerActive} onClickOutside={() => setEditDimmerActive(false)}>
            <div className={"editor-window"}>
                <div className={"qr-code-header"}>
                    <h1 className={"config-qr-code-header-text"}>Team {formToEdit.team} - Quals {formToEdit.match_number}</h1>
                    <Button icon={"x"} color={"red"} onClick={() => setEditDimmerActive(false)}/>
                </div>
                <p>ID:⠀
                    <Popup
                        content={"Copy ID to clipboard"}
                        trigger={
                            <span className={"match-id-copy"} onClick={() => {
                                navigator.clipboard.writeText(idMap.get(formToEdit.toString()) ?? "NOT FOUND")
                            }}>{idMap.get(formToEdit.toString())}
                            </span>
                        }
                />
                </p>
                {
                    formToEdit.fields.map(e => {
                        return formToEdit.toElement(e.label, (form:ScoutForm) => {setFormToEdit(form)})
                    })
                }

                <Button.Group fluid>
                    <Button color={"green"} onClick={() => {
                        if(!clickedSubmitOnce) {
                            setClickedSubmitOnce(true)
                        } else {
                            //Actually submit the form

                            EditForm(activeTemplate, idMap.get(formToEdit.toString()) ?? "NOT FOUND", formToEdit).then(
                                (r) => {
                                    setEditSuccess(r)
                                    setEditDimmerActive(false)
                                    setEditSuccessDimmerActive(true)
                                }
                            )

                        }

                    }}>
                        <Icon name={"save"}/> {!clickedSubmitOnce ? "Submit" : "Click again to Confirm"}
                    </Button>
                    <Button.Or/>
                    <Button color={"red"} onClick={() => {
                        setEditDimmerActive(false)
                    }}>
                        <Icon name={"cancel"}/> Cancel
                    </Button>
                </Button.Group>
            </div>
        </Dimmer>

        <Dimmer active={editSuccessDimmerActive} onClickOutside={() => setEditSuccessDimmerActive(false)} page>
            <div className={"vertical-center"}>
                <div>
                    <Icon name={editSuccess ? "check" : "delete"} color={editSuccess ? "green" : "red"} size={"massive"}/>
                </div>
                <h1>{editSuccess ? "Edit success!" : "Edit Failure! :("}</h1>
            </div>
        </Dimmer>

    </div>
}


class Record {
    constructor(
        public wins:number,
        public losses:number,
        public ties:number,
    ) {
    }

    public combine(other:Record):Record {
        return new Record(
            this.wins + other.wins,
            this.losses + other.losses,
            this.ties + other.ties,
        )
    }

    public toString() {
        return `${this.wins}-${this.losses}-${this.ties}`

    }
}

class TeamEventInfo {

    constructor(
        public eventKey:string,
        public eventName:string,
        public rank:number,
        public lastPlayedMatch:string,
        public allianceNum:number,
        public qualRecord:Record,
        public playoffRecord:Record,
        public won:boolean,
    ) {}

    public static getSeasonRecordString(infos:TeamEventInfo[]):string {
        return infos
            .map(e => e.qualRecord.combine(e.playoffRecord))
            .reduce((acc, ele) => acc.combine(ele), new Record(0, 0, 0))
            .toString()
    }

    public getQualsRecord():string {
        return this.qualRecord.toString()
    }

    public getPlayoffRecord():string {
        return this.playoffRecord.toString()
    }

    public static fromJson(key:string, name:string, data:any) {

        return new TeamEventInfo(
            key,
            name,
            data?.qual?.ranking.rank ?? -1,
            data?.last_match_key ?? "null",
            data?.alliance?.number ?? -1,
            new Record(
                data?.qual?.ranking.record.wins ?? 0,
                data?.qual?.ranking.record.losses ?? 0,
                data?.qual?.ranking.record.ties ?? 0
            ),
            new Record(
                data?.playoff?.record.wins ?? 0,
                data?.playoff?.record.losses ?? 0,
                data?.playoff?.record.ties ?? 0
            ),
            data?.playoff?.status === "won"
        )
    }
}

function EventTable(props: {events:TeamEventInfo[]}) {
    return <Table>
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell className={"center-cell-text"}>Rank</Table.HeaderCell>
                <Table.HeaderCell className={"center-cell-text"}>Quals</Table.HeaderCell>
                <Table.HeaderCell className={"center-cell-text"}>Alliance</Table.HeaderCell>
                <Table.HeaderCell className={"center-cell-text"}>Playoffs</Table.HeaderCell>
            </Table.Row>
        </Table.Header>

        <Table.Body>
            {props.events.map(e => {

                    return <Table.Row
                        key={e.eventKey}
                        className=
                            {e.rank === 1 || e.qualRecord.losses === 0 ||
                            (e.playoffRecord.losses === 0 && e.playoffRecord.wins > 0) ? "good-job-row" : ""}
                    >
                        <Table.Cell>{e.eventName}</Table.Cell>
                        <Table.Cell className={"center-cell-text"}>{e.rank !== -1 ? e.rank : "N/A"}</Table.Cell>
                        <Table.Cell className={"center-cell-text"}>{e.getQualsRecord()}</Table.Cell>
                        <Table.Cell className={"center-cell-text"}>{e.allianceNum !== -1 ? e.allianceNum : "None"}</Table.Cell>
                        <Table.Cell className={"center-cell-text"}>{e.getPlayoffRecord()}</Table.Cell>
                    </Table.Row>
                }
            )}
        </Table.Body>
    </Table>;
}

export default TeamViewPage;