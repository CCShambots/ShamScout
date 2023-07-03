import React from "react";
import Header from "../components/header/Header";
import {useSearchParams} from "react-router-dom";

function TeamViewPage() {
    const [searchParams] = useSearchParams();
    let num= parseInt(searchParams.get("number") || "0")

    return <div>
        <Header/>
        <h1>{num}</h1>
    </div>
}

export default TeamViewPage;