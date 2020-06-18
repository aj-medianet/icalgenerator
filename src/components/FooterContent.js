import React, { Component } from 'react'

class Footer extends Component {
    render() {
        return (
            <footer className="footer container-fluid pt-5  pb-5 bg-dark text-light">

                <div className="row">

                    <div className="col-sm text-center">
                        <a className="text-light" href="https://aj-media.net" target="_blank" rel="noopener noreferrer">
                            &copy; AJ MEDIA | {new Date().getFullYear()}
                        </a>
                    </div>

                </div>
            </footer>
        )
    }
}

export default Footer;