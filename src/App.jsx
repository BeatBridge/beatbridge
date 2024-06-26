import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Landing from './components/landing/Landing';
import ListenerDashboard from './components/listener/dashboard/ListenerDashboard';

function App() {

  return (
    <>
		<Routes>
			<Route path="/" element={<Landing />} />
			<Route path="/l/dashboard" element={<ListenerDashboard />} />
		</Routes>
	</>
  )
}

export default App
