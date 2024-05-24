import './css/App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import { useState } from 'react';

import Home from './pages/Home';
import Over from './pages/Over';
import Landing from './pages/Landing';

function App() {
  const [imageData, setImageData] = useState([]);
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/home' element={<Home setImageData={setImageData}/>}/>
          <Route path='/over' element={<Over imageData={imageData}/>}/>
          
        </Routes>
      </Router>
    </>
  );
}

export default App;
