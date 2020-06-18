import React, { Component } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle';



class Navigation extends Component {

    render() {
        return (
            <header className="">
                <nav className="navbar navbar-expand-lg navbar-dark bg-black">
                    <div className="navbar-brand">iCal Generator</div>
                    <div className="navbar-brand ml-auto"><a className="text-light" href="/">Reset Form</a></div>
                </nav>
            </header>
        )
    }
}

export default Navigation;