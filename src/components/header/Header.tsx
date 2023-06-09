import React from "react";
import "./Header.css"
import {Link} from "react-router-dom";
import Dropdown from "../dropdown/Dropdown";
import {DropDownOptions, KeyValuePair} from "../dropdown/DropDownOptions";

type HeaderProps = {
}

function Header({}: HeaderProps) {

    let options = new DropDownOptions(
        [new KeyValuePair("2023miliv", "Livonia"),
            new KeyValuePair("2023milan", "Lansing"),
            new KeyValuePair("2023milan1", "Lansing"),
            new KeyValuePair("2023milan2", "Lansing"),
            new KeyValuePair("2023milan3", "Lansing"),
            new KeyValuePair("2023milan4", "Lansing"),
            new KeyValuePair("2023milan5", "Lansing"),
            new KeyValuePair("2023milan6", "Lansing"),
            new KeyValuePair("2023milan7", "Lansing"),
            new KeyValuePair("2023milan8", "Lansing"),
            new KeyValuePair("2023milan9", "Lansing"),
            new KeyValuePair("2023milan10", "Lansing")
        ])

    return(
        <div className={"header-container"}>
                <div className={"header-item"}>
                    <Link className={"link"} to={"/"}>Overview</Link>
                    <Link className={"link"} to={"/scan"}>Scan</Link>
                    <Link className={"link"} to={"/matches"}>Matches</Link>
                    <Link className={"link"} to={"/team"}>Team</Link>
                    <Link className={"link"} to={"/scheduler"}>Scheduling</Link>
                    <Link className={"link"} to={"/config"}>Config</Link>
                </div>

                <div className={"header-item"}>
                    <Dropdown options={options} type={"Game"} />
                    <Dropdown options={options} type={"Event"} />
                </div>
        </div>
    )
}

export default Header;