import './css/app.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import { useState } from 'react';

import Home from './pages/Home';
import Over from './pages/Over';


function App() {
  const [imageData, setImageData] = useState([]);

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Home setImageData={setImageData}/>}/>
          <Route path='/over' element={<Over imageData={imageData}/>}/>
        </Routes>
      </Router>
    </>
  );
}


export default App;
