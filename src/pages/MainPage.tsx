import React, {useEffect, useState} from "react";
import Header from "../components/header/Header";
import Checklist from "../components/main/Checklist";
import MissingMatchesDisplay from "../components/main/MissingMatchesDisplay";
import {Pull, PullTBA} from "../util/APIUtil";
import {ScoutForm} from "../components/ScoutForm";
import {useLocalStorage} from "usehooks-ts";
import Match from "../components/scheduling/matchDisplay/Match";
import "./MainPage.css"
import {Schedule} from "../components/scheduling/matchDisplay/ScheduleData";

function MainPage() {

    let [currentEvent] = useLocalStorage("current-event", "")
    let [submittedForms, setSubmittedForms] = useState<ScoutForm[]>([])


    let [matches, setMatches] = useLocalStorage<Match[]>(`matches-${currentEvent}`, [])

    let [schedule, setSchedule] = useState(new Schedule(["Quals 1"], ["test"], []));

    //Load whatever schedule is currently saved to the API
    useEffect(() => {
        PullTBA(`event/${currentEvent}/matches/keys`, (tbaData) => {

            let numQuals = tbaData.filter((ele:any) => ele.indexOf(currentEvent+"_qm") !== -1).length;

            schedule.setNumMatches(numQuals)
            setSchedule(schedule)

            Pull(`schedules/${currentEvent}`, (data) => {
                setSchedule(Schedule.fromJson(data, numQuals));
            }).then(() => {})
        })
    }, [currentEvent])

    useEffect(() => {

        Pull(`template/test/get?event=${currentEvent}`, (data) => {
            setSubmittedForms(data.map((e:any) =>
                ScoutForm.fromJson(e)
            ))
        }).then(() => {})
    }, [currentEvent])

    return (
        <div>
            <Header/>
            <div className={"main-page-content"}>
                <Checklist/>

                <MissingMatchesDisplay submittedForms={submittedForms} matches={matches} schedule={schedule}/>
            </div>

        </div>
    )
}

export default MainPage;