import React, {useState} from "react";
import {useLocalStorage} from "usehooks-ts";
import {Button, Checkbox, Icon} from "semantic-ui-react";
import "./Checklist.css"

function Checklist() {

    const defaultChecklist:ChecklistItem[] = [
        new ChecklistItem("Ensure you're on the most recent version (check Github)"),
        new ChecklistItem("Event Setup (in Config) - Before Event", [
            new ChecklistItem("Enter event key (From TBA)"),
            new ChecklistItem("Set TBA API key"),
            new ChecklistItem("Ensure team list is correct"),
            new ChecklistItem("Select game config"),
            new ChecklistItem("Make sure config fields are correct"),
        ]),
        new ChecklistItem("Setup Scouters - At Event", [
            new ChecklistItem("(In Config) Have scouters scan current event key"),
            new ChecklistItem("(In Config) Have scouters scan game config"),
            new ChecklistItem("Get list of matches any scouters need to miss"),
            new ChecklistItem("Create scouting schedule after match schedule releases"),
            new ChecklistItem("Post schedule to server"),
            new ChecklistItem("Make sure scouters have their schedules", [
                new ChecklistItem("(If needed) Have scouters scan their schedules"),
            ])
        ]),
        new ChecklistItem("Supervise scouting"),
        new ChecklistItem("Wait for team to be ranked top 8 (hopefully)"),
        new ChecklistItem("Download data and analyze"),
    ]

    let [currentEvent] = useLocalStorage("current-event", "")
    let [checkListState, setCheckListState] =
        useLocalStorage<ChecklistItem[]>(`checklist-${currentEvent}`, [...defaultChecklist])

    return(
        <div>
            <Button
                onClick={() => {
                    setCheckListState([...defaultChecklist])
                    window.location.reload()
                }}
                size={"big"}
                color={"red"}>
                    <Icon name={"eraser"}/>Clear List
            </Button>
            {
                ChecklistItem.generateComponent(checkListState, () => setCheckListState([...checkListState]))
            }
        </div>
    )
}

function ChecklistItemComponent(props: {item:ChecklistItem, updateState:() => void}) {

    let [checked, setChecked] = useState(props.item.checked)

    let updateChecked = (val:boolean) => {
        setChecked(val)
        props.item.checked = val;

        props.updateState();
    }

    return (
        <div>
            <div className={"checklist-item"}>
                <Checkbox className={"checklist-checkbox"} checked={checked}
                          onChange={(e, data) => updateChecked(data.checked!)}/>
                <div className={"checklist-info " + (checked ? "checklist-info-active" : "")}>
                    <h2 className={"checklist-text"}>{props.item.name}</h2>
                    <div className={"checklist-cross-off " + (checked ? "checklist-cross-off-active" : "") }/>
                </div>
                {/*<h4>{checked ? props.item.getUnfinishedChildren() + " Unfinished!" : ""}</h4>*/}
            </div>

            <div className={"child-checklist " + (checked ? "child-checklist-hidden" : "")}>
                {ChecklistItem.generateComponent(props.item.children, props.updateState)}
            </div>
        </div>
    )
}

class ChecklistItem {

    constructor(
        public name:string,
        public children:ChecklistItem[] = [],
        public checked:boolean = false
    ) {

    }

    public static generateComponent(items:ChecklistItem[], updateState: () => void) {
        return items.map(e =>
            <ChecklistItemComponent item={e} updateState={updateState}/>
        )
    }

    public static fromJson(e:any) {
        return new ChecklistItem(
            e.name,
            e.checked,
            e.children.map((ele:any) => ChecklistItem.fromJson(ele))
        )
    }

    public getUnfinishedChildren():number {
        return this.children.reduce((acc, ele) => {
            acc += ele.checked ? 0 : 1

            acc += ele.getUnfinishedChildren()

            return acc
        }, 0);
    }
}

export default Checklist;