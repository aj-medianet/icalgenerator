import React, { Component } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle';



class Navigation extends Component {

    render() {
        return (
            <header className="">
                <nav className="navbar navbar-expand-lg navbar-dark bg-black">
                    <div className="navbar-brand">iCal Generator</div>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ml-auto">
                            {/*
                            <li className="nav-item">
                                <a className="nav-link" href="/software">Software</a>
                            </li>
                            */}
                            
                        </ul>
                    </div>
                </nav>
            </header>
        )
    }
}

export default Navigation;