import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/home/Home';

function App() {

  return (
    <>
		<Routes>
			<Route path="/" element={<Home />} />
		</Routes>
	</>
  )
}

export default App
