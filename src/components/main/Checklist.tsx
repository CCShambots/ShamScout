import React, {useEffect, useState} from "react";
import {useLocalStorage} from "usehooks-ts";
import {Button, Icon} from "semantic-ui-react";
import "./Checklist.css"
import {CHECKLIST, CURRENT_EVENT} from "../../util/LocalStorageConstants";

function Checklist() {

    const defaultChecklist:ChecklistItem[] = [
        new ChecklistItem("Ensure you're on the most recent version (check Github)"),
        new ChecklistItem("Ensure all scouters and Pit Scouters are on the most recent version"),
        new ChecklistItem("Event Setup (in Config) - Before Event", [
            new ChecklistItem("Enter event key (From TBA)"),
            new ChecklistItem("Set TBA API key"),
            new ChecklistItem("Set Remote API host"),
            new ChecklistItem("Ensure team list is correct"),
            new ChecklistItem("Select game config"),
            new ChecklistItem("Make sure config fields are correct"),
        ]),
        new ChecklistItem("Photo Taking - At Load-in", [
            new ChecklistItem("Assign pit scouters to teams"),
            new ChecklistItem("Ensure all teams have photos in the database (Important! You can't miss any)"),
        ]),
        new ChecklistItem("Setup Scouters - At Event", [
            new ChecklistItem("(In Config) Have scouters scan current event key, etc."),
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

    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")
    let [checkListState, setCheckListState] =
        useLocalStorage<ChecklistItem[]>(CHECKLIST(currentEvent), [...defaultChecklist])

    //Reload page if checklist does not have the same content as the default
    useEffect(() => {
        if(
            ChecklistItem.arrayToString(ChecklistItem.convertBackToProperObjects(checkListState)) !== ChecklistItem.arrayToString(defaultChecklist)
        ) {
            console.log("reloading")
            setCheckListState([...defaultChecklist])
            window.location.reload()
        }
    }, []);

    return(
        <div className={"checklist-container"}>
            <div className={"checklist-header"}>
                <h1>Checklist</h1>
                <Button
                    onClick={() => {
                        setCheckListState([...defaultChecklist])
                        window.location.reload()
                    }}
                    className={"checklist-clear-button"}
                    color={"red"}>
                        <Icon name={"eraser"}/>Clear List
                </Button>
            </div>
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
                <div className="checkbox-wrapper-65">
                    <label htmlFor="cbk1-65">
                        <input
                            type="checkbox"
                            checked={checked}
                            readOnly
                        />
                        <span className="cbx" onClick={() => updateChecked(!checked)}>
                            <svg width="12px" height="11px" viewBox="0 0 12 11">
                                <polyline points="1 6.29411765 4.5 10 11 1"></polyline>
                            </svg>
                        </span>
                    </label>
                </div>
                <div className={"checklist-info " + (checked ? "checklist-info-active" : "")}>
                    <p className={"checklist-text"}>{props.item.name}</p>
                    <div className={"checklist-cross-off " + (checked ? "checklist-cross-off-active" : "") }/>
                </div>
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
            <ChecklistItemComponent key={e.name} item={e} updateState={updateState}/>
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

    public makeString():string {
        return this.name + this.children.map((e) => e.makeString())
    }

    public static arrayToString(items:ChecklistItem[]):string {
        return items.map((e) => e.makeString()).join("")
    }

    public static convertBackToProperObjects(items:ChecklistItem[]):ChecklistItem[] {
        return items.map(e => new ChecklistItem(e.name, this.convertBackToProperObjects(e.children), e.checked))
    }
}

export default Checklist;