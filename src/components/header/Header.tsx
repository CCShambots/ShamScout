import React from "react";
import "./Header.css"
import {Link} from "react-router-dom";
import Dropdown from "../dropdown/Dropdown";
import {DropDownOptions, KeyValuePair} from "../dropdown/DropDownOptions";

type HeaderProps = {
    admin: boolean
}

function Header({admin}: HeaderProps) {

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
                    <Link className={"link"} to={"/"}>Event</Link>
                    <Link className={"link"} to={"/"}>Team</Link>
                    {
                        //Only display the admin page if the user is an admin
                        {admin} ? <Link className={"link"} to={"/"}>Admin</Link> : <div></div>
                    }
                </div>

                <div className={"header-item"}>
                    <Dropdown options={options} type={"Game"} />
                    <Dropdown options={options} type={"Event"} />
                </div>
        </div>
    )
}

export default Header;