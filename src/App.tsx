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
import {IsApiAlive} from "./util/APIUtil";
import {Dimmer, Header, Icon} from "semantic-ui-react";

function App() {

    const [apiAlive, setApiAlive] = useState(true)

    useEffect(() => {
        let interval = setInterval(() =>{
            checkAPI()
        }, 5000)

        return () => clearInterval(interval)
    });



    const checkAPI = async () => {

        let result = await IsApiAlive()

        setApiAlive(result);
    }

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
                <Route path='/scheduler' element={ <SchedulingPage /> } />
                <Route path='/config' element={ <ConfigPage /> } />

                <Route path="/*" element={<NavLink to="/" />}  /> {/* navigate to default route if no url matched */}
            </Routes>

          </HashRouter>

          <Dimmer page active={!apiAlive}>
              <div className={"api-message-icon"}>
                <Icon color={"red"} name={"unlink"} size={"massive"}/>
              </div>
              <Header inverted>Couldn't Connect to the API! Start Your Local API Instance.</Header>
          </Dimmer>
      </div>
  );
}

export default App;
