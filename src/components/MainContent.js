import React, { Component } from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

class MainContent extends Component {
  constructor() {
    super()
    this.state = {
      eventID: "",
      eventName: "",
      location: "",
      trigger: "60",
    }
  }

  componentDidMount() {
  }

  changeHandler = (event) => {
    let key = event.target.name
    let val = event.target.value
    this.setState({ [key]: val })
  }

  submit = (event) => {
    console.log(this.state.eventID)
    console.log(this.state.eventName)
    console.log(this.state.location)
    console.log(this.state.trigger)
  }


  LoadingSpinner = () => {
    return this.state.isLoading ? <Spinner className="ml-2" animation="border" variant="success" /> : ''
  }

  render() {
    return (
      <div className="p-3">
        <div className="row">
          <div className="col-sm text-left">
            <Form>
              <Form.Group>
                <Form.Label>Event ID</Form.Label>
                <Form.Control className="w-50" onChange={this.changeHandler} type="text" name="eventID" placeholder="Enter Event ID" required />
              </Form.Group>

              <Form.Group>
                <Form.Label>Event Name</Form.Label>
                <Form.Control className="w-50" onChange={this.changeHandler} type="text" name="eventName" placeholder="Enter Event Name" required />
              </Form.Group>

              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Control className="w-50" onChange={this.changeHandler} type="text" name="location" placeholder="Enter Event Location" required />
              </Form.Group>

              <Form.Group>
                <Form.Label>Trigger</Form.Label>
                <Form.Control onChange={this.changeHandler} className="w-50" as="select" name="trigger">
                  <option value="60">One Hour</option>
                  <option value="1440">One Day</option>
                </Form.Control>
              </Form.Group>

              


              <Button variant="primary" onClick={this.submit}>
                Submit
              </Button>
            </Form>
          </div>
        </div>
      </div>
    )
  }
}
export default MainContent 
