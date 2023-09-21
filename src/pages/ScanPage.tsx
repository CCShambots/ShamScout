import React, {useState} from "react";
import Header from "../components/header/Header";
import QrReader from 'react-qr-scanner';
import {Post} from "../util/APIUtil";
import {useLocalStorage} from "usehooks-ts";
import {Dimmer, Icon} from "semantic-ui-react";
import "./ScanPage.css";

function ScanPage() {

    let [result, setResult] = useState("");

    let [currentTemplate] = useLocalStorage("active-template", "")

    let [saveSuccess, setSaveSuccess] = useState(true)
    let [saveDimmerActive, setSaveDimmerActive] = useState(false)

    const previewStyle = {
        height: 480,
        width: 640,
    }

    let handleScan = (data:any) =>{
        if(data) {
            setResult(data.text);

            Post(`forms/submit/template/${currentTemplate}`, `${data.text}`).then(r => {
                setSaveDimmerActive(true);
                setSaveSuccess(r);
            })
        }
    }
    let handleError = (err:any) =>{
        console.error(err)
    }

    return (
        <div className={"header-explode"}>
            <Header/>

            <div className={"qr-reader-holder"}>
                <QrReader
                    delay={100}
                    style={previewStyle}
                    onError={handleError}
                    onScan={handleScan}
                />
            </div>
            <p className={"scan-qr-text"}>{result}</p>

            <Dimmer active={saveDimmerActive} onClickOutside={() => setSaveDimmerActive(false)} page>
                <div className={"vertical-center"}>
                    <div>
                        <Icon name={saveSuccess ? "check" : "delete"} color={saveSuccess ? "green" : "red"} size={"massive"}/>
                    </div>
                    <h1>{saveSuccess ? "Save success!" : "Save Failure! :("}</h1>
                </div>
            </Dimmer>
        </div>
    )
}

export default ScanPage;