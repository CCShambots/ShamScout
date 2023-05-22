import React, {useEffect, useRef, useState} from "react";
import "./Dropdown.css"
import DownArrow from "../../resources/expand.svg"
import {DropDownOptions, KeyValuePair} from "./DropDownOptions";

type DropdownProps = {
    options:DropDownOptions;
    type:string;
    startValue:string;
}

function Dropdown({options, type, startValue=""}:DropdownProps) {

    const initialValue = "Select " + type;

    let [choices, setChoices] = useState(options.options);
    let [inputValue, setInputValue] = useState("");

    //The key of the current value
    let [selected, setSelected] = useState("")

    let [placeholder, setPlaceholer] = useState(initialValue)

    let [active, setActive] = useState(false)

    let inputRef = useRef<HTMLInputElement>(null)

    function getInputElement():HTMLInputElement {
        if(inputRef.current) {
            return inputRef.current;
        }

        return new HTMLInputElement();
    }

    function handleSelection(pair:KeyValuePair) {
        setSelected(pair.key)
        setPlaceholer(pair.getDisplayName())
    }

    return(
        <div>
            <div className={"dropdown-container " + (active ? "active-container" : "")}
                 onClick={
                () => {
                    getInputElement().focus()
                }}
                onBlur={() => setTimeout(() => setActive(false), 125)}
            >

                <div className={"input-container"}>
                    <input ref={inputRef} className={"input"}
                           onFocus={() => setActive(true)}
                           placeholder={placeholder} onChange={(event) => {
                               setInputValue(event.target.value)
                               setChoices(options.options.filter((ele)=>
                                   ele.getDisplayName().toLowerCase().indexOf(event.target.value.toLowerCase()) !== -1
                               ) )
                    }} value={inputValue} onKeyDown={(e) => {
                        if(e.key === "Enter") {
                            handleSelection(choices[0])
                        }
                    }}/>
                </div>
                <div className={"right"}>
                    {/*<span className={"divider"}/>*/}
                    <img src={DownArrow} alt={"down arrow"} className={"arrow"}/>
                </div>
            </div>

            {
                active ?
                    <div className={"dropdown-options"}>
                        {
                            choices.map(e =>
                                <div className={"option-container "
                                    + (choices.indexOf(e) === 0 ? "next-choice" : "") //Handle this being the next option

                                }
                                     key={e.key} onClick={() => {
                                    handleSelection(e)
                                    getInputElement().blur()

                                }}>
                                    <p className = {"option-contents"}>
                                        {e.getDisplayName()}
                                    </p>
                                </div>

                            )
                        }
                        {
                            choices.length === 0 ? <p className={"option"}>Not other options!</p> : <div/>

                        }
                    </div>
                : <div/>
            }

        </div>
    )
}

//Handle an event and pass the value to the given function
function withEvent(func: Function): React.ChangeEventHandler<any> {
    return (event: React.ChangeEvent<any>) => {
        const { target } = event;
        func(target.value);
    };
}

export default Dropdown;