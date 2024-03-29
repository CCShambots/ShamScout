import React from "react";
import "./Header.css"
import {Link} from "react-router-dom";
import {useLocalStorage} from "usehooks-ts";
import packageJson from "../../../package.json";
import {CURRENT_EVENT} from "../../util/LocalStorageConstants";
import {Popup} from "semantic-ui-react";

function AppHeader() {

    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")

    let mobileVersion = require("../../../package.json").com_ccshambots.mobile_version
    let shamPicVersion = require("../../../package.json").com_ccshambots.shampic_version


    return(
        <div className={"header-container"}>
                <div className={"header-item"}>
                    <Link className={"link"} to={"/"}>Overview</Link>
                    <Link className={"link"} to={"/scan"}>Scan</Link>
                    <Link className={"link"} to={"/matches"}>Matches</Link>
                    <Link className={"link"} to={"/teams"}>Teams</Link>
                    <Link className={"link"} to={"/picklist"}>Picklist</Link>
                    <Link className={"link"} to={"/scheduler"}>Scheduling</Link>
                    <Link className={"link"} to={"/config"}>Config</Link>
                </div>

                <div className={"header-item header-side-text"}>
                    <h2 className={"header-text"}>
                            {currentEvent}
                    </h2>
                    <Popup
                        content={
                        <div>
                            <p>Minimum Mobile Version: {mobileVersion}</p>
                            <p>Minimum ShamPic Version: {shamPicVersion}</p>
                        </div>
                    }
                        trigger={
                            <h2 className={"header-text"}>
                                    v{packageJson.version}
                            </h2>
                        }
                    />
                </div>
        </div>
    )
}

export default AppHeader;