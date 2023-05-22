import React from 'react';
import logo from './logo.svg';
import './App.css';
import {HashRouter, NavLink, Route, Routes} from "react-router-dom";
import OverviewPage from "./pages/MainPage";

function App() {
  return (
      <HashRouter basename={`/`}>
        <Routes>
          <Route path='' element={ <OverviewPage /> } />

          <Route path="/*" element={<NavLink to="/" />}  /> {/* navigate to default route if no url matched */}
        </Routes>

      </HashRouter>
  );
}

export default App;
