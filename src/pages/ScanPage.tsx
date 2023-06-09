import React, {useEffect, useState} from "react";
import Header from "../components/header/Header";
import QrReader from 'react-qr-scanner';

function ScanPage() {

    let [result, setResult] = useState("");

    const previewStyle = {
        height: 480,
        width: 640,
    }

    let handleScan = (data:any) =>{
        if(data) {
            setResult(data.text);
        }
    }
    let handleError = (err:any) =>{
        console.error(err)
    }

    return (
        <div>
            <Header/>

            <QrReader
                delay={100}
                style={previewStyle}
                onError={handleError}
                onScan={handleScan}
            />
            <p>{result}</p>
        </div>
    )
}

export default ScanPage;