import React from 'react';
import logo from './logo.svg';
import './App.css';
import {HashRouter, NavLink, Route, Routes} from "react-router-dom";
import OverviewPage from "./pages/MainPage";
import SchedulingPage from "./pages/SchedulingPage";

function App() {
  return (
      <HashRouter basename={`/`}>
        <Routes>
          <Route path='' element={ <OverviewPage /> } />
          <Route path='/scheduler' element={ <SchedulingPage /> } />

          <Route path="/*" element={<NavLink to="/" />}  /> {/* navigate to default route if no url matched */}
        </Routes>

      </HashRouter>
  );
}

export default App;
