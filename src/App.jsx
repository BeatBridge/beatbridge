import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Landing from './components/landing/Landing';
import ListenerDashboard from './components/listener/dashboard/ListenerDashboard';
import Login from './components/login/Login';
import SignUp from './components/signup/SignUp';
import API from './api.js';

function App() {
	const [JWT, setJWT] = useState(null);
	const [userInfo, setUserInfo] = useState({});
	const navigate = useNavigate();

	useEffect(() => {
		const localJWT = localStorage.getItem('jwt');
		if (localJWT) {
			setJWT(localJWT);
		}
	}, []);

	useEffect(() => {
		const fetchUserInfo = async() => {
			if (JWT) {
				const data = await API.getUserInfo(JWT);
				if (data.error) {
					localStorage.removeItem('jwt');
					setJWT(null);
					navigate('/login');
				} else {
					setUserInfo(data);
				}
			}
		};
		fetchUserInfo();
	}, [JWT, navigate]);

  return (
    <>
		<Routes>
			<Route path="/" element={<Landing />} />
			<Route path="/l/dashboard" element={<ListenerDashboard userInfo={userInfo}/>} />
			<Route path='/login' element={<Login setJWT={setJWT} />} />
			<Route path='/signup' element={<SignUp setJWT={setJWT} />} />
		</Routes>
	</>
  )
}

export default App
