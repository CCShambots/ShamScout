import React, {createRef, useEffect, useState} from "react";
import Header from "../components/header/Header";
import Checklist from "../components/main/Checklist";
import MissingMatchesDisplay from "../components/main/MissingMatchesDisplay";
import {Pull, PullTBA} from "../util/APIUtil";
import {ScoutForm} from "../components/ScoutForm";
import {useLocalStorage} from "usehooks-ts";
import Match from "../components/scheduling/matchDisplay/Match";
import "./MainPage.css"
import {Schedule} from "../components/scheduling/matchDisplay/ScheduleData";
import {Button, Icon, Statistic} from "semantic-ui-react";
import {CSVLink} from "react-csv";
import {GameConfig} from "../components/config/GameConfig";
import {Simulate} from "react-dom/test-utils";

function MainPage() {

    let [currentEvent] = useLocalStorage("current-event", "")
    let [activeTemplate] = useLocalStorage("active-template", "")
    let [submittedForms, setSubmittedForms] = useState<ScoutForm[]>([])

    let [matches] = useLocalStorage<Match[]>(`matches-${currentEvent}`, [])

    let [schedule, setSchedule] = useState(new Schedule(["Quals 1"], ["test"], []));

    //Load whatever schedule is currently saved to the API
    useEffect(() => {
        PullTBA(`event/${currentEvent}/matches/keys`, (tbaData) => {

            let numQuals = tbaData.filter((ele:any) => ele.indexOf(currentEvent+"_qm") !== -1).length;

            schedule.setNumMatches(numQuals)
            setSchedule(schedule)

            Pull(`schedules/get/event/${currentEvent}`, (data) => {
                setSchedule(Schedule.fromJson(data, numQuals));
            }).then(() => {})
        })
    }, [currentEvent])

    //Load submitted forms
    useEffect(() => {

        let orderOfItems:string[] = [];

        Pull(`templates/get/name/${activeTemplate}`, (data) => {
            let config:GameConfig = GameConfig.fromJson(data)

            orderOfItems = config.items.map((e) => e.label);
        })

        Pull(`forms/get/template/${activeTemplate}?event=${currentEvent}`, (data) => {

            let forms:ScoutForm[] = data.map((e:any) =>
                ScoutForm.fromJson(e[0])
            )

            forms.forEach((e) => {
                e.fields.sort((e1, e2) => orderOfItems.indexOf(e1.label) - orderOfItems.indexOf(e2.label))
            })

            setSubmittedForms(forms);
        }).then(() => {})
    }, [currentEvent])

    let downloadCSVRef:any = createRef()

    return (
        <div>
            <Header/>
            <div className={"main-page-content"}>
                <Checklist/>

                <div className={"center-column"}>
                    <div className={"table-manager"}>
                        <Button
                            size={"huge"}
                            color={"blue"}
                            onClick={() => downloadCSVRef.current.link.click()}>
                            <Icon name={"table"}/>Download CSV for {currentEvent}
                        </Button>
                        <CSVLink ref={downloadCSVRef} data={submittedForms} headers={submittedForms[0]?.generateHeader()} filename={`${currentEvent}-data.csv`}/>
                    </div>

                    <Statistic value={submittedForms.length} label={"Forms Submitted"}/>

                </div>

                <MissingMatchesDisplay submittedForms={submittedForms} matches={matches} schedule={schedule}/>
            </div>

        </div>
    )
}

export default MainPage;