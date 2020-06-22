import React from 'react';
import '../Navbar.css';
import {IoLogoGithub} from 'react-icons/io';

const navStyle = {
    height: '100px',
    backgroundColor: '#000000',
    marginTop: '0',
    color: '#FFFFFF',
    textAlign: 'center',
    verticalAlign: 'middle',
    lineHeight: '80px',
    boxShadow: '0px 4px 4px #191414',
    paddingTop: '10px'
}
const Navbar = () => {
    return (
        <div style={navStyle}>
            <p style={{margin: 0, fontSize: '60px', fontWeight: 'bold'}}>Spotify Playlist Generator</p>
                <a href="http://www.github.com/raymondchuu" className="githublink" target="_blank" rel="noopener noreferrer"><IoLogoGithub style={{float: 'right', position: 'relative', top: '-3.7em', marginRight: '3%', height: '40px', width: '40px'}} /></a>
        </div>
    )
}

export default Navbar