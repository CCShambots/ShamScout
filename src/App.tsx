import React, {useEffect, useState} from 'react';
import './App.css';
import {HashRouter, NavLink, Route, Routes} from "react-router-dom";
import OverviewPage from "./pages/MainPage";
import SchedulingPage from "./pages/SchedulingPage";
import MatchPage from "./pages/MatchPage";
import TeamsPage from "./pages/TeamsPage";
import ConfigPage from "./pages/ConfigPage";
import ScanPage from "./pages/ScanPage";
import TeamViewPage from "./pages/TeamViewPage";
import PicklistPage from "./pages/PicklistPage";
import {IsApiAlive, setApiHost} from "./util/APIUtil";
import {Button, Dimmer, Header, Icon} from "semantic-ui-react";
import {NewVersionChecker} from "./components/NewVersionChecker";
import VSPage from "./pages/VSPage";
import {useLocalStorage} from "usehooks-ts";
import SelectAPIType from "./components/config/SelectAPIType";

function App() {

    const [apiAlive, setApiAlive] = useState(true)

    const [useLocalAPI] = useLocalStorage("use-local-api", true)

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

    useEffect(() => {
        setApiHost(useLocalAPI)
    }, [useLocalAPI]);

  return (
      <div>
          <HashRouter>
            <Routes>
                <Route path='/' element={ <OverviewPage /> } />
                <Route path='/scan' element={ <ScanPage/>} />
                <Route path='/matches' element={ <MatchPage /> } />
                <Route path='/teams' element={ <TeamsPage /> } />
                <Route path='/team' element={<TeamViewPage/>}/>
                <Route path='/picklist' element={<PicklistPage/>}/>
                <Route path='/vs' element={<VSPage/>}/>
                <Route path='/scheduler' element={ <SchedulingPage /> } />
                <Route path='/config' element={ <ConfigPage /> } />

                <Route path="/*" element={<NavLink to="/" />}  /> {/* navigate to default route if no url matched */}
            </Routes>

          </HashRouter>

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
