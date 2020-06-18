import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, } from  'react-router-dom';
import './App.css';

import Navigation from './components/Nav'
import Footer from './components/FooterContent'
import MainContent from './components/MainContent'


class App extends Component {
  constructor() {
    super()
    this.state = {

    }
  }
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Navigation/>
            <Switch>
              <Route path="/" component={MainContent} exact/>
            </Switch>
          <Footer/>
        </div>
      </BrowserRouter>
    );
  }
}
export default App