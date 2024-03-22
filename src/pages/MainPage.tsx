import React, {createRef, useEffect, useState} from "react";
import AppHeader from "../components/header/AppHeader";
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
import {FormTemplate} from "../components/config/FormTemplate";
import {ACTIVE_TEMPLATE, CURRENT_EVENT, MATCHES, TEAMS} from "../util/LocalStorageConstants";
import {formsList, scheduleDetails, templateDetails} from "../util/APIConstants";
import {TeamDocuments} from "../components/teams/TeamDocument";
import {PDFDownloadLink} from "@react-pdf/renderer";
import {team} from "./TeamsPage";

function MainPage() {

    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")
    let [activeTemplate] = useLocalStorage(ACTIVE_TEMPLATE, "")
    let [submittedForms, setSubmittedForms] = useState<ScoutForm[]>([])

    let [teams] = useLocalStorage<team[]>(TEAMS(currentEvent), []);

    let [matches] = useLocalStorage<Match[]>(MATCHES(currentEvent), [])

    let [schedule, setSchedule] = useState(new Schedule(["Quals 1"], ["test"], []));

    //Load whatever schedule is currently saved to the API
    useEffect(() => {
        PullTBA(`event/${currentEvent}/matches/keys`, (tbaData) => {

            let numQuals = tbaData.filter((ele:any) => ele.indexOf(currentEvent+"_qm") !== -1).length;

            schedule.setNumMatches(numQuals)
            setSchedule(schedule)

            Pull(scheduleDetails(currentEvent), (data) => {
                setSchedule(Schedule.fromJson(data, numQuals));
            }).then(() => {})
        })
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

                    <PDFDownloadLink document={
                        <TeamDocuments data={submittedForms} teams={teams}/>
                    } fileName="somename.pdf">
                        {({ blob, url, loading, error }) =>
                            loading ? 'Loading document...' : 'Download now!'
                        }
                    </PDFDownloadLink>

                </div>

                <MissingMatchesDisplay submittedForms={submittedForms} matches={matches} schedule={schedule}/>
            </div>

        </div>
    )
}

export default MainPage;