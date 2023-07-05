import React, {useState} from "react";
import {useLocalStorage} from "usehooks-ts";
import {Checkbox} from "semantic-ui-react";
import "./Checklist.css"

function Checklist() {

    let [currentEvent] = useLocalStorage("current-event", "")
    let [checkListState, setCheckListState] = useLocalStorage<ChecklistItem[]>(`checklist-${currentEvent}`,
        [
            new ChecklistItem("Setup Event (in Config)", [
                new ChecklistItem("Enter Event Key (From TBA)"),
                new ChecklistItem("Set TBA API Key"),
                new ChecklistItem("Ensure Team List is Correct"),
                new ChecklistItem("Select Game Config"),
                new ChecklistItem("Make sure Config Fields are Correct"),
                new ChecklistItem("TODO"),
            ])
        ]
    )

    return(
        <div>
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