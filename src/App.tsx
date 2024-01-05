import React, {useEffect, useState} from 'react';
import './App.css';
import {
    createHashRouter,
    createRoutesFromElements, Link,
    Route,
    RouterProvider,
} from "react-router-dom";
import OverviewPage from "./pages/MainPage";
import SchedulingPage from "./pages/SchedulingPage";
import MatchPage from "./pages/MatchPage";
import TeamsPage from "./pages/TeamsPage";
import ConfigPage from "./pages/ConfigPage";
import ScanPage from "./pages/ScanPage";
import TeamViewPage from "./pages/TeamViewPage";
import PicklistPage from "./pages/PicklistPage";
import {
    apiHost, Authorize,
    CheckJWT,
    remoteAPIAddress,
    setApiHost,
    setApiRemoteHost,
    updateJWTValue
} from "./util/APIUtil";
import {Button, Dimmer, Header, Icon, Input, Popup} from "semantic-ui-react";
import {NewVersionChecker} from "./components/NewVersionChecker";
import VSPage from "./pages/VSPage";
import {useLocalStorage} from "usehooks-ts";
import SelectAPIType from "./components/config/SelectAPIType";
import {API_HOST_ADDRESS, EMAIL, JWT, USE_LOCAL_API} from "./util/LocalStorageConstants";

function App() {

    const [apiAlive, setApiAlive] = useState(true)

    const [useLocalAPI] = useLocalStorage(USE_LOCAL_API, true)
    const [apiHostAddress] = useLocalStorage(API_HOST_ADDRESS, remoteAPIAddress)

    const [jwt, setJwt]  = useLocalStorage(JWT, "")
    const [email, setEmail] = useLocalStorage(EMAIL, "")
    const [tempCode, setTempCode] = useState("")

    setApiRemoteHost(apiHostAddress)
    setApiHost(useLocalAPI)
    
    useEffect(() => {
        setApiRemoteHost(apiHostAddress)
        setApiHost(useLocalAPI)

    }, [useLocalAPI, apiHostAddress]);


    useEffect(() => {
        //Immediately check API connection
        checkAPI().then(() => {})

        let interval = setInterval(() =>{
            checkAPI().then(() => {})
        }, 5000)

        return () => clearInterval(interval)
    });

    const checkAPI = async () => {

        updateJWTValue(jwt)

        try {
            CheckJWT().then((status) => {
                if(status !== 200) {
                    console.log(status)
                    setApiAlive(false)
                } else {
                    setApiAlive(true)
                }
            })

        } catch {
            console.log("ERROR IN CHECKING API CONNECTION")
            //Auth fails because no JWT saved
            setApiAlive(false)
        }
    }

    //Check JWT info
    useEffect(() => {


    }, []);

    useEffect(() => {
        updateJWTValue(jwt)
    }, [jwt]);


    const router = createHashRouter(
        createRoutesFromElements(

            <Route>
                <Route index path="/" element={<OverviewPage />}/>
                <Route path='scan' element={ <ScanPage/>} />
                <Route path='matches' element={ <MatchPage /> } />
                <Route path='teams' element={ <TeamsPage /> } />
                <Route path='team' element={<TeamViewPage/>}/>
                <Route path='picklist' element={<PicklistPage/>}/>
                <Route path='vs' element={<VSPage/>}/>
                <Route path='scheduler' element={ <SchedulingPage /> } />
                <Route path='config' element={ <ConfigPage /> } />
            </Route>
        )
    )


  return (
      <div>

          <RouterProvider router={router} />

          <Dimmer page active={!apiAlive}>
              <div className={"api-message-icon"}>
                <Icon color={"red"} name={"unlink"} size={"massive"}/>
              </div>
              <Header inverted>Couldn't Connect to the API! Start your {useLocalAPI ? "Local" : "Remote"} API Instance or Switch API Type.</Header>
              <SelectAPIType/>

              <Popup
                content={
                  "If you have already done this authorization, then the database is likely entirely inaccessible"
                }
                trigger={
                    <Header inverted>Database Authorization*</Header>
                }
                position={"top center"}
              />
              <Button color={"blue"} fluid onClick={() => {window.open(apiHost + "code", "_blank")}}>
                <Icon name={"chain"}/> Open Page to Authorize
              </Button>
                <Input error={tempCode === ""} fluid placeholder={"Enter Code"} onChange={(e) => {
                    setTempCode(e.target.value)
                }}/>
                <Input error={email === ""} fluid placeholder={"Enter Email"} value={email} onChange={(e) => {
                    setEmail(e.target.value)
                }}/>
              <Button disabled={tempCode === "" || email === ""} fluid color={"green"} onClick={() => {
                    Authorize(tempCode, email).then((jwt) => {
                        if(jwt !== "") {
                            setJwt(jwt)
                            setApiAlive(true)
                        }
                    })
              }}><Icon name={"lock"}/> Authorize</Button>
          </Dimmer>

          <NewVersionChecker/>
      </div>
  );
}

export default App;
