import React from 'react';
import Spotify from 'spotify-web-api-js';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Alert from 'react-bootstrap/Alert';
import { animateScroll as scroll } from 'react-scroll';
import '../Main.css';

const spotifyWebApi = new Spotify();

class Main extends React.Component{
    constructor(props) {
        super(props);
        const params = this.getHashParams();

        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handlePlaylistName = this.handlePlaylistName.bind(this);

        this.state = {
            loggedIn: params.access_token ? true : false,
            artists: '',
            tracks: [],
            trackuri: [],
            playlistName: '',
            device_id: '',
            user_id: '',
            success: true,
            show: false,
            showSearchError: false,
        }

        if (params.access_token) {
            spotifyWebApi.setAccessToken(params.access_token)
        }
    }

    getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ( e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    componentDidMount() {
        spotifyWebApi.getMe()
        .then((res) => {
            this.setState({
            user_id: res.id
            })
        })
    }

    handleSearchChange(event) {
        this.setState({
            artists: event.target.value
        })
    }

    handleSearchArtistId() {
        this.setState({tracks: [], trackuri: []})
        let artists = this.state.artists.split(',');
        artists.map(artistName => (
            spotifyWebApi.searchArtists(artistName) 
            .then((res) => {
                let artistId = res.artists.items[0].id
                spotifyWebApi.getArtistTopTracks(artistId, "CA")
                .then((res) => {
                    console.log(res)
                    for (let i = 0; i < res.tracks.length; i++) {
                        this.setState(state => {
                            const tracks = state.tracks.concat(res.tracks[i])
                            const trackuri = state.trackuri.concat(res.tracks[i].uri)
                            return {tracks, trackuri}
                        })
                    }
                })
            })
            .catch((err) => {
                console.log(err);
                this.setState({
                    showSearchError: true
                })
                setTimeout(() => {
                    this.setState({
                        showSearchError: false
                    })
                }, 3000)
            }) 
        ))
    }
    
    handlePlaylistName(event) {
        this.setState({
            playlistName: event.target.value
        })
    }

    handleCreatePlaylist() {
        spotifyWebApi.createPlaylist(this.state.user_id, {name: this.state.playlistName})
        .then((res) => {
            spotifyWebApi.addTracksToPlaylist(this.state.user_id, res.id, this.state.trackuri)
            this.setState({
                success: true
            })
        })
        .catch((err) => {
            console.log(err)
            this.setState({
                success: false
            })
        })

    }

    createPlaylist() {
        this.handleCreatePlaylist();
        this.setState({show: true})
        setTimeout(() => {
            this.setState({show: false})
        }, 3000);
        scroll.scrollToBottom()
    }


    scrollToTracks() {
        scroll.scrollTo(550)
    }

    searchTracks() {
        this.handleSearchArtistId();
        this.scrollToTracks();
    }

    render() {
        return (
            <div style={{backgroundColor: '#212121', height: '100%', width: '100%'}}>
                {this.state.loggedIn ? "" : 
                <div style={{paddingTop: '5%'}}>
                    <a href="http://localhost:8888" className="loginbutton">
                        CLICK TO LOG IN
                    </a>
                </div>
                }
                {this.state.loggedIn ? 
                <div>
                    <div className="introbackground">
                    <div className="intro">
                        <p style={{fontSize: '30px'}}>This Spotify playlist generator is used to generate a playlist of top songs from your favourite artists.</p>
                        <p style={{fontSize: '30px'}}>To get started, type the names of your favourite artists into the search bar, separated by commas!</p>
                    </div>
                    </div>
                    <form className="form">
                        <InputGroup className="artistInput" style={{width: '30%', margin: 'auto', textDecoration: 'none', borderRadius: '30px', boxSizing: 'border-box', marginBottom: '1%'}}>
                            <InputGroup.Prepend>
                            <InputGroup.Text>
                                <svg className="bi bi-search" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/>
                                    <path fillRule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
                                </svg>
                            </InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl style={{outline: 'none', boxShadow: 'none ', border: '1px solid #ccc '}}
                                type="search"
                                className="artistInput"
                                placeholder="Search&#x2026;"
                                value={this.state.artists} 
                                onChange={this.handleSearchChange}
                            />
                        </InputGroup>

                        <button className="searchbutton" type="button" style={{marginTop: '2%',}} onClick={() => this.searchTracks()}>
                            SEARCH TOP TRACKS
                        </button>

                        {this.state.showSearchError ? 
                        <Alert style={{display: 'block', margin: 'auto', width: '40%', height: '50px', marginTop: '2%'}} variant="danger" dismissible onClose={() => this.setState({showSearchError: false}) }>
                                <Alert.Heading>
                                    Unable to find artists! Please try again.
                                </Alert.Heading>
                        </Alert> 
                        : ""} 

                    </form>

                    <div style={{textAlign: 'center', marginTop: '3%'}}>
                        <div className="trackslist">
                            <ul id="tracks">
                                {this.state.tracks.map(track => (
                                    <div>
                                    <li style={{marginBottom: '3%'}} key={track.id}><img src={track.album.images[0].url} style={{width: '50px'}}/>&emsp;{track.name}</li>
                                    </div>
                                ))}
                            </ul>
                        </div>
                        { this.state.tracks.length > 0 ? 
                        <form className="form" style={{textAlign: 'center', alignContent: 'center'}}>
                            <InputGroup style={{textAlign: 'center', margin: 'auto', width: '30%', marginBottom: '1%'}}>
                                <InputGroup.Prepend>
                                <InputGroup.Text>
                                    <svg className="bi bi-collection-play" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M14.5 13.5h-13A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5zm-13 1A1.5 1.5 0 0 1 0 13V6a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 16 6v7a1.5 1.5 0 0 1-1.5 1.5h-13zM2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1z"/>
                                        <path fillRule="evenodd" d="M6.258 6.563a.5.5 0 0 1 .507.013l4 2.5a.5.5 0 0 1 0 .848l-4 2.5A.5.5 0 0 1 6 12V7a.5.5 0 0 1 .258-.437z"/>
                                    </svg>
                                </InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl style={{outline: 'none', boxShadow: 'none ', border: '1px solid #ccc'}}
                                    type="text"
                                    placeholder="Playlist Name"
                                    value={this.state.playlistName}
                                    onChange={this.handlePlaylistName}
                                />
                            </InputGroup>
                        
                            <button className="searchbutton" style={{marginTop: '2%', marginBottom: '2%'}} type="button" onClick={() => this.createPlaylist()}>
                                CREATE PLAYLIST
                            </button>

                            {this.state.show ? 
                                <Alert style={{display: 'block', margin: 'auto', width: '25%', height: '50px', marginTop: '2%', marginBottom: '3%'}} variant={this.state.success ? "success" : "danger"} dismissible onClose={() => this.setState({show: false}) }>
                                <Alert.Heading>
                                    {this.state.success ? "Playlist Created!" : "Error! Please try again."}
                                </Alert.Heading>
                            </Alert>
                            : ""}

                        </form>
                        : ""}
                    </div>
                </div> 
                : ""}
            </div>
        )
    }
}

export default Main