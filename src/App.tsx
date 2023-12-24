import React, {useEffect, useState} from 'react';
import './App.css';
import {
    createHashRouter,
    createRoutesFromElements,
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
import {IsApiAlive, remoteAPIAddress, setApiHost, setApiRemoteHost} from "./util/APIUtil";
import {Button, Dimmer, Header, Icon} from "semantic-ui-react";
import {NewVersionChecker} from "./components/NewVersionChecker";
import VSPage from "./pages/VSPage";
import {useLocalStorage} from "usehooks-ts";
import SelectAPIType from "./components/config/SelectAPIType";
import {API_HOST_ADDRESS, USE_LOCAL_API} from "./util/LocalStorageConstants";
import {createHash} from "node:crypto";

function App() {

    const [apiAlive, setApiAlive] = useState(true)

    const [useLocalAPI] = useLocalStorage(USE_LOCAL_API, true)
    const [apiHostAddress] = useLocalStorage(API_HOST_ADDRESS, remoteAPIAddress)

    setApiRemoteHost(apiHostAddress)
    setApiHost(useLocalAPI)
    
    useEffect(() => {
        setApiRemoteHost(apiHostAddress)
        setApiHost(useLocalAPI)

    }, [useLocalAPI, apiHostAddress]);


    useEffect(() => {
        let interval = setInterval(() =>{
            checkAPI().then(() => {})
        }, 5000)

        return () => clearInterval(interval)
    });

    const checkAPI = async () => {

        let result = await IsApiAlive()

        setApiAlive(result);
    }


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
          {/*<HashRouter>*/}
          {/*  <Routes>*/}
          {/*      <Route path='/' element={ <OverviewPage /> } />*/}
          {/*      <Route path='/scan' element={ <ScanPage/>} />*/}
          {/*      <Route path='/matches' element={ <MatchPage /> } />*/}
          {/*      <Route path='/teams' element={ <TeamsPage /> } />*/}
          {/*      <Route path='/team' element={<TeamViewPage/>}/>*/}
          {/*      <Route path='/picklist' element={<PicklistPage/>}/>*/}
          {/*      <Route path='/vs' element={<VSPage/>}/>*/}
          {/*      <Route path='/scheduler' element={ <SchedulingPage /> } />*/}
          {/*      <Route path='/config' element={ <ConfigPage /> } />*/}

          {/*      <Route path="/*" element={<NavLink to="/" />}  /> /!* navigate to default route if no url matched *!/*/}
          {/*  </Routes>*/}

          {/*</HashRouter>*/}

          <RouterProvider router={router} />

          <Dimmer page active={!apiAlive}>
              <div className={"api-message-icon"}>
                <Icon color={"red"} name={"unlink"} size={"massive"}/>
              </div>
              <Header inverted>Couldn't Connect to the API! Start your {useLocalAPI ? "Local" : "Remote"} API Instance or Switch API Type.</Header>
              <SelectAPIType/>
          </Dimmer>

          <NewVersionChecker/>
      </div>
  );
}

export default App;
