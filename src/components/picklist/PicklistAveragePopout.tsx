import "./PicklistAveragePopout.css"
import {Field, ScoutForm} from "../ScoutForm";
import React, {useState} from "react";
import {Button} from "semantic-ui-react";

type passedInfo = {
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right",
    forms:ScoutForm[],
    number:number,
    name:string,
    removeSelf:(number:number) => void
}

export default function PicklistAveragePopout({position, forms, number, name, removeSelf}: passedInfo) {

    return <div className={"stats-container " + position + " "}>
        <div className={"stats-container-header"}>
            <h1>{number} - {name}</h1>
            <Button className={"stats-close-button"} color={"red"} icon={"close"} onClick={() => {
                removeSelf(number)
            }}/>
        </div>
        <div className={"stat-lines"}>
            {forms[0]?.fields.map(field => {
                let result =  forms.map(e => e.fields.filter(ele => ele.label === field.label)[0]);

                let [value, percent] = Field.takeAverage(result)

                return <div className={"stat-line"}>
                    <h3>{field.label}</h3>
                    <h3>
                        {value !== -1 ? (percent ? value + "%" : value) : "N/A"}
                    </h3>
                </div>
            })}

        </div>

    </div>
}