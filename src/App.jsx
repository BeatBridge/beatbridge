import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Landing from './components/landing/Landing';
import ListenerDashboard from './components/listener/dashboard/ListenerDashboard';
import Login from './components/login/Login';

function App() {

  return (
    <>
		<Routes>
			<Route path="/" element={<Landing />} />
			<Route path="/l/dashboard" element={<ListenerDashboard />} />
			<Route path='/login' element={<Login />} />
		</Routes>
	</>
  )
}

export default App
