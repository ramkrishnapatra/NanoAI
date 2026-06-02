import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import ManageRoute from './routes/ManageRoute.jsx';

function App() {
 
  return (
    <div className="">

      <Routes>
        <Route path='/*' element={<ManageRoute/>}></Route>

      </Routes>



    </div>
  );
}

export default App;
