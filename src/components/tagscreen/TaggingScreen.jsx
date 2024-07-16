import React, { useState, useEffect } from 'react';
import API from '../../api.js';
import './taggingscreen.css'

const TaggingScreen = () => {

  return (
    <div className="container">
        <div className='row'>
            <div className='col-md-12 sub-screen'>
                <h1>In this screen, you can find songs that you tagged.</h1>
            </div>
        </div>
    </div>
  )
}

export default TaggingScreen;
