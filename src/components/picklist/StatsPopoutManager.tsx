import PicklistAveragePopout from "./PicklistAveragePopout";
import {useEffect, useState} from "react";
import {ScoutForm} from "../ScoutForm";
import {Pull} from "../../util/APIUtil";
import {useLocalStorage} from "usehooks-ts";
import {ACTIVE_TEMPLATE, CURRENT_EVENT} from "../../util/LocalStorageConstants";
import {FormTemplate} from "../config/FormTemplate";
import {Button, Icon} from "semantic-ui-react";

export default function StatsPopoutManager(props: {teamsArray:{number:number, name:string}[], setTeamsArray: (teams:{number:number, name:string}[]) => void}) {

    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")
    let [activeTemplate] = useLocalStorage(ACTIVE_TEMPLATE, "")

    let [forms, setForms] = useState<ScoutForm[]>([])

    let [hideStats, setHideStats] = useState(false)


    useEffect(() => {

        let orderOfItems:string[] = [];

        Pull(`templates/get/name/${activeTemplate}`, (data) => {
            let config:FormTemplate = FormTemplate.fromJson(data)

            orderOfItems = config.items.map((e) => e.label);
        })


        Pull(`forms/get/template/${activeTemplate}?event=${currentEvent}`, (data) => {

            let forms: ScoutForm[] = data.map((e: any) =>
                ScoutForm.fromJson(e[0])
            )

            forms.forEach((e) => {
                e.fields.sort((e1, e2) => orderOfItems.indexOf(e1.label) - orderOfItems.indexOf(e2.label))
            })

            setForms(forms)
        })
    }, []);

    let removeItem = (number:number) => {
        props.setTeamsArray(props.teamsArray.filter(e => e.number !== number))
    }

    return(
        <div>
            {props.teamsArray.length >= 1 ?
                hideStats ?
                    <div className={"hide-stats-button"}>
                        <Button.Group>
                            <Button color={"green"} onClick={() => {
                                setHideStats(false)
                            }}><Icon name={"redo"} />Show Stat Windows</Button>
                            <Button color={"red"} onClick={() => {
                                props.setTeamsArray([])
                                setHideStats(false)
                            }}><Icon name={"close"} />Remove All Stat Windows</Button>
                        </Button.Group>

                    </div> :
                    <div className={"hide-stats-button"}>
                        <Button color={"red"} onClick={() => {
                            console.log("setting value")
                            setHideStats(true)
                        }}><Icon name={"hide"} />Hide Stat Windows</Button>
                    </div>
                : <div/>
            }
            {
                !hideStats ?
                    <div>
                        {props.teamsArray.length >= 1 ?
                            <PicklistAveragePopout
                                position={"top-right"}
                                number={props.teamsArray[0].number}
                            name={props.teamsArray[0].name}
                            forms={forms.filter(e => e.team === props.teamsArray[0].number)}
                            removeSelf={removeItem}
                        />
                        : <div/>
                    }
                    {props.teamsArray.length >= 2 ?
                        <PicklistAveragePopout
                            position={"bottom-right"}
                            number={props.teamsArray[1].number}
                            name={props.teamsArray[1].name}
                            forms={forms.filter(e => e.team === props.teamsArray[1].number)}
                            removeSelf={removeItem}
                        />
                        : <div/>
                    }
                    {props.teamsArray.length >= 3 ?
                        <PicklistAveragePopout
                            position={"top-left"}
                            number={props.teamsArray[2].number}
                            name={props.teamsArray[2].name}
                            forms={forms.filter(e => e.team === props.teamsArray[2].number)}
                            removeSelf={removeItem}
                        />
                        : <div/>
                    }
                    {props.teamsArray.length >= 4 ?
                        <PicklistAveragePopout
                            position={"bottom-left"}
                            number={props.teamsArray[3].number}
                            name={props.teamsArray[3].name}
                            forms={forms.filter(e => e.team === props.teamsArray[3].number)}
                            removeSelf={removeItem}
                        />
                        : <div/>
                    }
                </div>   : <div/>
            }
        </div>

    )

}