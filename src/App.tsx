import React from 'react';
import logo from './logo.svg';
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

function App() {
  return (
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
  );
}

export default App;
