import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AgregarProductos from './agregarProductos';
import Inventario from './Inventario';
import Home from './Home'; // Vista principal (Agregar productos)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Vista principal */}
        <Route path="/agregarProductos" element={<AgregarProductos />} />
        <Route path="/inventario" element={<Inventario />} />
      </Routes>
    </Router>
  );
}


export default App;