import React, { Component } from 'react';

import { BaustellenList } from './components/baustellen-list-component/baustellen-list-component'
import { SearchBar } from './components/search-row-component/search-row-component'
import './App.css';

class App extends Component{
  constructor(){
    super();
    this.state = {
        mitarbeiter: [],
        baustellen: [],
        baustellenSucheNamen: '',
        baustellenSucheDateVon: '',
        baustellenSucheDateBis: ''
    };
  }
  componentDidMount(){
    /*take all baustellen and set the state*/
    fetch('http://localhost:8080/getAlleBaustellenMitTaetigkeiten',{
      method: 'post'
    }).then(response => response.json())
      .then(baustellenliste => this.setState({baustellen: baustellenliste}))
      .catch(error => console.log(error));
    /*take all mitarbeiter and set the state*/
    fetch('http://localhost:8080/getAlleMitarbeiter',{
      method: 'post'
    }).then(response => response.json())
      .then(mitarbeiterliste => this.setState({mitarbeiter: mitarbeiterliste}))
      .catch(error => console.log(error));
  }
  render(){
    /* filter for name ort und plz */
    const baustellen = this.state.baustellen;
    const baustellenFilterName = this.state.baustellenSucheNamen;
    const filterdBaustellen = baustellen.filter(baustelle => baustelle.name.toLowerCase().includes(baustellenFilterName.toLowerCase()) || baustelle.ort.toLowerCase().includes(baustellenFilterName.toLowerCase()) || baustelle.plz.toLowerCase().includes(baustellenFilterName.toLowerCase()))
    /*todo filter datum von bis*/
    const baustellenFilterDateVon = this.state.baustellenSucheDateVon;
    const baustellenFilterDateBis = this.state.baustellenSucheDateBis;
    return (
      <div className="App">
        <SearchBar handleChange={e => this.setState({baustellenSucheNamen: e.target.value})}/>
        <BaustellenList baustellen={filterdBaustellen}>
          {/* {this.state.mitarbeiter.map(mitarbeiter => <h1 key={mitarbeiter.id}>{mitarbeiter.name}</h1>)} */}
        </BaustellenList>
      </div>
    );
  }
}

export default App;
