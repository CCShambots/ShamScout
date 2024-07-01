import React, {createRef, useEffect, useState} from "react";
import AppHeader from "../components/header/AppHeader";
import Checklist from "../components/main/Checklist";
import MissingMatchesDisplay from "../components/main/MissingMatchesDisplay";
import {Pull, PullTBA} from "../util/APIUtil";
import {CombinedForm, ScoutForm} from "../components/ScoutForm";
import {useLocalStorage} from "usehooks-ts";
import Match from "../components/scheduling/matchDisplay/Match";
import "./MainPage.css"
import {Schedule} from "../components/scheduling/matchDisplay/ScheduleData";
import {Button, Icon, Statistic} from "semantic-ui-react";
import {CSVLink} from "react-csv";
import {FormTemplate} from "../components/config/FormTemplate";
import {ACTIVE_TEMPLATE, CURRENT_EVENT, MATCHES} from "../util/LocalStorageConstants";
import {formsList, scheduleDetails, templateDetails} from "../util/APIConstants";

function MainPage() {

    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")
    let [activeTemplate] = useLocalStorage(ACTIVE_TEMPLATE, "")
    let [submittedForms, setSubmittedForms] = useState<ScoutForm[]>([])
    let [combinedForms, setCombinedForms] = useState<CombinedForm[]>([]);

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

    useEffect(() => {
        setCombinedForms(ScoutForm.takeAverages(submittedForms))
    }, [submittedForms])

    useEffect(() => {
        console.log(combinedForms)
        if(combinedForms.length > 0) {
            console.log(combinedForms[0].generateHeader())
        }
    }, [combinedForms]);

    let rawCSVRef:any = createRef()
    let combinedCSVRef:any = createRef()

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
                            onClick={() => rawCSVRef.current.link.click()}>
                            <Icon name={"table"}/>Raw CSV for {currentEvent}
                        </Button>
                        <CSVLink ref={rawCSVRef} data={submittedForms}
                                 headers={submittedForms[0]?.generateHeader()} filename={`${currentEvent}-raw-data.csv`}/>
                    </div>

                    <div className={"table-manager"}>
                        <Button
                            size={"huge"}
                            color={"blue"}
                            onClick={() => combinedCSVRef.current.link.click()}>
                            <Icon name={"table"}/>Combined CSV for {currentEvent}
                        </Button>
                        <CSVLink ref={combinedCSVRef} data={combinedForms}
                                 headers={combinedForms[0]?.generateHeader()} filename={`${currentEvent}-combined-data.csv`}/>
                    </div>

                    <Statistic value={submittedForms.length} label={"Forms Submitted"}/>

                </div>

                <MissingMatchesDisplay submittedForms={submittedForms} matches={matches} schedule={schedule}/>
            </div>

        </div>
    )
}

export default MainPage;