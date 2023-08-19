import React, {useState} from "react";
import QRCode from "react-qr-code";
import {Button} from "semantic-ui-react";

export function splitString(code:string, splitLength:number = 750) {

    const numChunks = Math.ceil(code.length / splitLength)
    const chunks:string[] = new Array(numChunks)

    for (let i = 0, o = 0; i < numChunks; ++i, o += splitLength) {
        chunks[i] = code.substring(o, o+splitLength)
    }

    let total = 0

    return chunks.map(e => {
        total++

        return `pt${chunks.indexOf(e) !== chunks.length - 1 ? total : "f"}:${e}`
    });


}

export function QRDisplay(props: {
    splitCode:string[]
}) {

    let [currentSplitIndex, setCurrentSplitIndex] = useState(0)

    return(
        <div>
            <QRCode value={props.splitCode[currentSplitIndex]} className={"qr-code-big"}/>
            <p className={"wrap-text"}>{props.splitCode[currentSplitIndex]}</p>

            <h2>Part {currentSplitIndex + 1} of {props.splitCode.length}</h2>

            <Button icon={"arrow left"} onClick={() => setCurrentSplitIndex(currentSplitIndex-1)} disabled={currentSplitIndex === 0}/>
            <Button icon={"arrow right"} onClick={() => setCurrentSplitIndex(currentSplitIndex+1)} disabled={currentSplitIndex === props.splitCode.length-1}/>

        </div>
    )

}