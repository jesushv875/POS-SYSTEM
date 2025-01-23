// src/Login.js
import React, { useState } from 'react';
import '../css/App.css'; 

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar el token en el localStorage
      localStorage.setItem('token', data.token);
      onLogin();  // Llama a la función onLogin para manejar el estado de la sesión
      alert(data.message);
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="container">
    <form onSubmit={handleSubmit}>
      
      <div> 
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Login</button>
    </form>
    </div>
  );
}

export default Login;