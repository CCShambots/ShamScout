import "./VSPage.css"
import PicklistTeamDisplay, {PercentData} from "../components/picklist/PicklistTeamDisplay";
import {useLocalStorage} from "usehooks-ts";
import React, {useEffect, useState} from "react";
import {ScoutForm} from "../components/ScoutForm";
import {Pull} from "../util/APIUtil";
import {GameConfig} from "../components/config/GameConfig";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Tooltip,
    XAxis, YAxis
} from "recharts";
import {Team} from "./TeamViewPage";

class PicklistTeamGraph {
    public teams:PicklistTeam[]
    public totalConnections:number;
    public totalCompletions:number;
    public unplayedCombinations:PicklistFight[]

    constructor(teams:Team[]) {
        this.teams = teams.map((e):PicklistTeam => {return {number: e.number, name: e.name, wins: [], losses: []}})
        this.totalConnections = (teams.length * (teams.length-1))/2.0

        this.unplayedCombinations = []
        this.totalCompletions = 0

        this.teams.forEach(e => {
            this.teams.filter(s => s !== e).forEach(s => {
                console.log(`add: ${e.number} vs. ${s.number}`)
                this.addPicklistFight(e, s)
            })
        })
    }

    addPicklistFight(team1:PicklistTeam, team2:PicklistTeam) {

        let dupe = false

        this.unplayedCombinations.forEach(e => {
            if((e.team1 === team1 || e.team1 === team2) && (e.team2 === team2 || e.team2 === team1)) dupe = true
        })

        if(!dupe) {
            this.unplayedCombinations.push({team1: team1, team2: team2})
        }
    }

    public propogateVictory(winner:PicklistTeam, loser:PicklistTeam) {

        console.log(`winner: ${winner.number}`)
        console.log(`loser: ${loser.number}`)

        console.log(loser.wins)

        loser.wins.forEach(e => {
            this.propogateVictory(winner, e)
        })

        winner.wins.push(loser)
        loser.losses.push(winner)

        console.log(this.unplayedCombinations)
        this.unplayedCombinations = this.unplayedCombinations.filter(e => {

            let winnerInMatch = e.team1.number === winner.number || e.team2.number === winner.number
            let loserInMatch = e.team1.number === loser.number || e.team2.number === loser.number

            let alreadyDone = winnerInMatch && loserInMatch

            return !alreadyDone
        })
        console.log(this.unplayedCombinations)

        this.totalCompletions++
    }

    public generateUnplayedCombination() {
        return this.unplayedCombinations[0]
    }
}

export type PicklistTeam = {
    number:number,
    name:string,
    wins:PicklistTeam[],
    losses:PicklistTeam[]
}

export type PicklistFight = {
    team1:PicklistTeam,
    team2:PicklistTeam
}

export default function VSPage() {

    let [currentEvent] = useLocalStorage("current-event", "")

    let [teams] = useLocalStorage<Team[]>(`teams-${currentEvent}`, []);

    let [graph] = useState(() => new PicklistTeamGraph(teams))

    let [activeTemplate] = useLocalStorage("active-template", "");

    let [thisEventForms, setThisEventForms] = useState<ScoutForm[]>([])

    let firstUnplayed = graph.generateUnplayedCombination()

    let [team1, setTeam1] = useState(firstUnplayed.team1)
    let [team2, setTeam2] = useState(firstUnplayed.team2)

    let [team1Data, setTeam1Data] = useState<PercentData[]>([])
    let [team2Data, setTeam2Data] = useState<PercentData[]>([])

    let [data, setData] = useState<any[]>([])

    useEffect(() => {

        let team1Forms = thisEventForms.filter(e => e.team === team1.number)
        let team2Forms = thisEventForms.filter(e => e.team === team2.number)

        if(team1Forms.length > 0 && team2Forms.length > 0) {

            let resultData = thisEventForms[0].fields.filter(e => e.type === "Rating" || e.type === "Number").map((e) => {

                let maxVal = 0

                let team1Average = team1Forms.reduce((acc, form) => {

                    let thisValue = (form.fields.filter(ele => ele.label === e.label)[0].value as number)

                    if(thisValue > maxVal) maxVal = thisValue

                    return acc + thisValue
                }, 0) / team1Forms.length

                let team2Average = team2Forms.reduce((acc, form) => {

                    let thisValue = (form.fields.filter(ele => ele.label === e.label)[0].value as number)

                    if(thisValue > maxVal) maxVal = thisValue

                    return acc + thisValue
                }, 0) / team2Forms.length

                return {
                    name: e.label,
                    [team1.number]: Math.round(team1Average * 100) / 100.0,
                    [team2.number]: Math.round(team2Average * 100) / 100.0,
                }
            })

            let fields = thisEventForms[0].fields.filter(e => e.type === "CheckBox")

            setTeam1Data(fields.map((e):PercentData => {

                let average = team1Forms.reduce((success, form) => {

                    let thisValue = (form.fields.filter(ele => ele.label === e.label)[0].value) as boolean

                    return thisValue ? success + 1 : success
                }, 0)

                return {
                    name: e.label,
                    value: Math.round(average/team1Forms.length * 100)
                }
            }))

            setTeam2Data(fields.map((e):PercentData => {

                let average = team2Forms.reduce((success, form) => {

                    let thisValue = (form.fields.filter(ele => ele.label === e.label)[0].value) as boolean

                    return thisValue ? success + 1 : success
                }, 0)

                return {
                    name: e.label,
                    value: Math.round(average/team2Forms.length * 100)
                }
            }))

            setData(resultData)
        }


    }, [team1, team2, thisEventForms]);

    useEffect(() => {
        let orderOfItems:string[] = [];

        Pull(`templates/get/name/${activeTemplate}`, (data) => {
            let config:GameConfig = GameConfig.fromJson(data)

            orderOfItems = config.items.map((e) => e.label);
        }).then(() => {})


        Pull(`forms/get/template/${activeTemplate}?event=${currentEvent}`, (data) => {

            let forms:ScoutForm[] = data.map((e:any) =>
                ScoutForm.fromJson(e[0])
            )

            forms.sort((e1, e2) => e1.match_number - e2.match_number)

            forms.forEach((e) => {
                e.fields.sort((e1, e2) => orderOfItems.indexOf(e1.label) - orderOfItems.indexOf(e2.label))
            })

            let thisEventForms = forms.filter((e) => e.event === currentEvent)

            setThisEventForms(thisEventForms)


        }).then(() => {})
    }, []);

    let indicateVictory = (winner:PicklistTeam, loser:PicklistTeam) => {
        graph.propogateVictory(winner, loser)

        let newCombo = graph.generateUnplayedCombination()

        console.log(newCombo.team1.number)
        console.log(newCombo.team2.number)

        setTeam1(newCombo.team1)
        setTeam2(newCombo.team2)
    }

    return (
        <div className={"dark-background"}>

            <div className={"left-display"}>
                <PicklistTeamDisplay
                    color={"lightcoral"}
                    team={team1}
                    thisData={team1Data}
                    otherData={team2Data}
                    left={true}
                    onClick={() => {
                        indicateVictory(team1, team2)
                    }}
                />
            </div>

            <div className={"vs-line-container"}>
                <div className={"vs-line"}/>
                <h1>VS.</h1>

            </div>

            <div className={"right-display"}>
                <PicklistTeamDisplay
                    color={"lightblue"}
                    team={team2}
                    thisData={team2Data}
                    otherData={team1Data}
                    left={false}
                    onClick={() => {
                        indicateVictory(team2, team1)
                    }}
                />
            </div>

            <h1 className={"top-vs-text"}>
                {graph.totalCompletions} of {graph.totalConnections}
            </h1>

            <div className={"chart"}>
                <BarChart width={730} height={250} data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={team1.number} fill="lightcoral" />
                    <Bar dataKey={team2.number} fill="lightblue" />
                </BarChart>
            </div>

        </div>
    )
}