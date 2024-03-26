import React, {createRef, useEffect, useState} from "react";
import AppHeader from "../components/header/AppHeader";
import Checklist from "../components/main/Checklist";
import MissingMatchesDisplay from "../components/main/MissingMatchesDisplay";
import {Pull} from "../util/APIUtil";
import {ScoutForm} from "../components/ScoutForm";
import {useLocalStorage} from "usehooks-ts";
import Match from "../components/scheduling/matchDisplay/Match";
import "./MainPage.css"
import {Schedule} from "../components/scheduling/matchDisplay/ScheduleData";
import {Button, Icon, Statistic} from "semantic-ui-react";
import {CSVLink} from "react-csv";
import {FormTemplate} from "../components/config/FormTemplate";
import {ACTIVE_TEMPLATE, BLACKLIST, CURRENT_EVENT, MATCHES} from "../util/LocalStorageConstants";
import {formsList, scheduleDetails, templateDetails} from "../util/APIConstants";
import {team} from "./TeamsPage";

function MainPage() {

    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")
    let [activeTemplate] = useLocalStorage(ACTIVE_TEMPLATE, "")
    let [submittedForms, setSubmittedForms] = useState<ScoutForm[]>([])

    let [matches] = useLocalStorage<Match[]>(MATCHES(currentEvent), [])
    let [blackList,] = useLocalStorage<team[]>(BLACKLIST(currentEvent),[])

    let [schedule, setSchedule] = useState(new Schedule(["Quals 1"], ["test"], [], matches, blackList));

    //Load whatever schedule is currently saved to the API
    useEffect(() => {

        schedule.setNumMatches(matches.length)
        setSchedule(schedule)

        Pull(scheduleDetails(currentEvent), (data) => {
            setSchedule(Schedule.fromJson(data, matches, blackList));
        }).then(() => {})
    }, [currentEvent])

    //Load submitted forms
    useEffect(() => {

        let orderOfItems:string[] = [];

        Pull(templateDetails(activeTemplate), (data) => {
            let config:FormTemplate = FormTemplate.fromJson(data)

            orderOfItems = config.items.map((e) => e.label);
        })

        Pull(`${formsList(activeTemplate)}?event=${currentEvent}`, (data) => {

            let forms:ScoutForm[] = data.map((e:any) =>
                ScoutForm.fromJson(e)
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
            <AppHeader/>
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