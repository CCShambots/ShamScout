import React, {createRef, useEffect, useState} from "react";
import Header from "../components/header/Header";
import {useSearchParams} from "react-router-dom";
import {useLocalStorage} from "usehooks-ts";
import Picture from "../resources/2056.jpg";
import "./TeamViewPage.css"
import {ScoutForm} from "../components/ScoutForm";
import {doesTeamHaveImage, getImagePath, Pull, PullTBA} from "../util/APIUtil";
import {Button, Icon, Table} from "semantic-ui-react";
import packageJson from '../../package.json';
import Banner from "../components/teams/Banner";
import { CSVLink } from "react-csv";
import {GameConfig} from "../components/config/GameConfig";

type team = {
    number:number,
    name:string
}

function TeamViewPage() {

    //TODO: Properly update state

    let [currentEvent] = useLocalStorage("current-event", "")

    let [activeTemplate] = useLocalStorage("active-template", "")

    let [teams] = useLocalStorage<team[]>(`teams-${currentEvent}`, []);

    const [searchParams] = useSearchParams();
    let teamNum= parseInt(searchParams.get("number") || "0")
    let [teamName, setTeamName] = useState("")

    let [, setSubmittedForms] = useState<ScoutForm[]>([])

    let [thisTeamForms, setThisTeamForms] = useState<ScoutForm[]>([])
    let [thisEventForms, setThisEventForms] = useState<ScoutForm[]>([])

    let year=  packageJson.version.substring(0, 4);

    let [events, setEvents] = useState<TeamEventInfo[]>([])

    let [imageInAPI, setImageInAPI] = useState(false)

    useEffect(() => {
        doesTeamHaveImage(teamNum).then((result) => {setImageInAPI(result)});
    }, [teamNum]);

    let downloadCSVRef:any = createRef()

    //Load in all the data
    useEffect(() => {

        let orderOfItems:string[] = [];

        Pull(`templates/get/name/${activeTemplate}`, (data) => {
            let config:GameConfig = GameConfig.fromJson(data)

            orderOfItems = config.items.map((e) => e.label);
        })


        Pull(`forms/get/template/${activeTemplate}`, (data) => {

            let forms:ScoutForm[] = data.map((e:any) =>
                ScoutForm.fromJson(e[0])
            )

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
    }, [currentEvent])

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
        <Header/>
        <div className={"top-row"}>
            <div className={"top-text"}>
                <h1>{teamNum}</h1>
                <h1>{teamName}</h1>
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
            {imageInAPI ?
            <img className={"team-view-pic"} src={getImagePath(teamNum)} alt={teamNum.toString()}/> :
            <img className={"team-view-pic"} src={Picture} alt={teamNum.toString()}/>
            }
        </div>

        <div className={"table-manager"}>
            <Button size={"huge"} color={"blue"} onClick={() => downloadCSVRef.current.link.click()}><Icon name={"table"}/>Download CSV</Button>
            <CSVLink ref={downloadCSVRef} data={thisTeamForms} headers={thisTeamForms[0]?.generateHeader()} filename={`${teamNum}-data.csv`}/>
        </div>

        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Match</Table.HeaderCell>
                    <Table.HeaderCell>Event</Table.HeaderCell>
                    {thisTeamForms[0]?.fields.map(e =>
                        <Table.HeaderCell key={e.label}>{e.label}</Table.HeaderCell>
                    )}
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {thisTeamForms.map(e =>
                    <Table.Row key={thisTeamForms.indexOf(e)}>
                        <Table.Cell>{e.match_number}</Table.Cell>
                        <Table.Cell>{e.event}</Table.Cell>
                        {
                            thisTeamForms[0]?.fields.map(field => {
                                return e.fields.filter(ele => ele.label === field.label).map((ele) =>
                                    <Table.Cell key={ele.getValue().toString()}>{ele.getValue().toString()}</Table.Cell>
                                )
                            })
                        }
                    </Table.Row>
                )}
            </Table.Body>
        </Table>
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
    return <Table className={"team-table-text-centering"}>
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Rank</Table.HeaderCell>
                <Table.HeaderCell>Quals</Table.HeaderCell>
                <Table.HeaderCell>Alliance</Table.HeaderCell>
                <Table.HeaderCell>Playoffs</Table.HeaderCell>
            </Table.Row>
        </Table.Header>

        <Table.Body>
            {props.events.map(e => {

                    let rank1Stars = e.rank === 1 ? "✨" : ""
                    let qualStars = e.qualRecord.losses === 0 && e.qualRecord.wins > 0 ? "✨" : ""
                    let playoffStars = e.playoffRecord.losses === 0 && e.playoffRecord.wins > 0 ? "✨" : ""

                    return <Table.Row key={e.eventKey}>
                        <Table.Cell>{e.eventName}</Table.Cell>
                        <Table.Cell>{rank1Stars}{e.rank !== -1 ? e.rank : "N/A"}{rank1Stars}</Table.Cell>
                        <Table.Cell>{qualStars}{e.getQualsRecord()}{qualStars}</Table.Cell>
                        <Table.Cell>{e.allianceNum !== -1 ? e.allianceNum : "None"}</Table.Cell>
                        <Table.Cell>{playoffStars}{e.getPlayoffRecord()}{playoffStars}</Table.Cell>
                    </Table.Row>
                }
            )}
        </Table.Body>
    </Table>;
}

export default TeamViewPage;