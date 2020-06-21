import React, { Component } from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import moment from 'moment-timezone'
import { saveAs } from 'file-saver';
const ics = require('ics');
const cal = require('generate-calendar-url');

class MainContent extends Component {
  constructor() {
    super()
    this.state = {
      eventID: "",
      eventName: "",
      location: "",
      trigger: "60",
      timeZone: "America/New_York",
      startDay: "01",
      startMonth: "01",
      startYear: "2020",
      startHour: "00",
      startMinutes: "00",
      endDay: "01",
      endMonth: "01",
      endYear: "2020",
      endHour: "00",
      endMinutes: "00",
      eventDescription: "",
      isLoading: false,
      errMessage: "",
    }
  }

  changeHandler = (event) => {
    let key = event.target.name
    let val = event.target.value
    this.setState({ [key]: val })
  }

  throwError(message) {
    this.setState({ errMessage: message })
    this.setState({ isLoading: false })
  }



  onSubmit = e => {
    e.preventDefault();
    this.setState({ errMessage: "" })
    this.setState({ isLoading: true })

    console.log(this.state.timeZone)
    // get start/end date & time with timezone -> convert to utc & format for input into ical generator
    let sd = moment.tz(this.state.startYear + '-' + this.state.startMonth + '-' + this.state.startDay + 'T' + this.state.startHour + ':' + this.state.startMinutes, this.state.timeZone).utc().format('YYYY-MM-DD-HH-mm').split('-');
    let ed = moment.tz(this.state.endYear + '-' + this.state.endMonth + '-' + this.state.endDay + 'T' + this.state.endHour + ':' + this.state.endMinutes, this.state.timeZone).utc().format('YYYY-MM-DD-HH-mm').split('-');

    console.log(sd)
    console.log(ed)

    //make sure dates are valid
    if (!moment(sd, 'YYYY-MM-DD-HH-mm').isValid()) {
      this.throwError('Error - The start date you chose does not exist')
      return false
    }
    if (!moment(ed, 'YYYY-MM-DD-HH-mm').isValid()) {
      this.throwError('Error - The end date you chose does not exist')
      return false
    }
    if (moment(ed).isBefore(sd)) {
      this.throwError('Error - The end date is before start date')
      return false
    }
    //get current day w/ timezone to check against start date
    let today = moment.tz(this.state.timeZone).format('YYYY-MM-DD-HH-mm').split('-');
    if (moment(sd).isBefore(today)) {
      this.throwError('Error - The start date is in the past')
      return false
    }

    //set up trigger
    let alarms = [];
    alarms.push({
      action: 'display',
      trigger: { minutes: this.state.trigger, before: true },
    });

    const icsData = {
      start: sd,
      end: ed,
      productId: 'ics generator',
      title: this.state.eventName,
      description: this.state.eventDescription,
      location: this.state.location,
      alarms: alarms
    }

    // fix weird safe integer error ics is throwing
    icsData.start[4] = parseInt(icsData.start[4])
    icsData.end[4] = parseInt(icsData.end[4])

    ics.createEvent(icsData, (error, value) => {
      if (error) {
        console.log(error);
        this.throwError("There was an error creating the ICS & VCS files. Please try again.")
      } else {
        //write ics & vcs files to user
        let blob = new Blob([value], { type: "text/plain;charset=utf-8" });
        saveAs(blob, this.state.eventID + ".ics");
        saveAs(blob, this.state.eventID + ".vcs");
        this.setState({ isLoading: false })
      }
    })

    //format start & end dates for google url gen
    let googleStart = moment(icsData.start, 'YYYY-MM-DD-HH-mm').format();
    let googleEnd = moment(icsData.end, 'YYYY-MM-DD-HH-mm').format();

    let googleData = {
      title: this.state.eventName,
      start: new Date(googleStart),
      end: new Date(googleEnd),
      location: this.state.location,
      description: this.state.eventDescription
    }

    //create google cal text file
    let blobGoogle = new Blob([cal.google(googleData)], { type: "text/plain;charset=utf-8" });
    saveAs(blobGoogle, this.state.eventID + "-google-cal.txt")
    

    this.setState({ isLoading: false })
  }

  LoadingSpinner = () => {
    return this.state.isLoading ? <Spinner className="ml-2" animation="border" variant="success" /> : ''
  }

  render() {
    return (
      <div className="p-3">
        <div className="row">
          <div className="col-sm text-center">
            <p className="text-danger">{this.state.errMessage ? this.state.errMessage : ''}</p>
          </div>
        </div>
        {this.state.isLoading ? <div className="pt-5 pb-5"><this.LoadingSpinner /></div> :
          <div className="row">
            <div className="col-sm text-left">
              <Form onSubmit={this.onSubmit}>
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

                <Form.Group>
                  <Form.Label>Time Zone</Form.Label>
                  <Form.Control onChange={this.changeHandler} className="w-50" as="select" name="timeZone">
                    <option value="America/New_York">US & Canada Eastern (-5:00) </option>
                    <option value="America/Indiana/Indianapolis">Indiana (East) (-5:00) </option>
                    <option value="America/Chicago">US & Canada Central (-6:00) </option>
                    <option value="America/Denver">US & Canada Mountain (-7:00) </option>
                    <option value="America/Phoenix">US Mountain (Arizona) (-7:00) </option>
                    <option value="America/Los_Angeles">US & Canada Pacific (-8:00) </option>
                    <option value="America/Juneau">US Alaska (-9:00) </option>
                    <option value="Pacific/Honolulu">US Hawaii (-10:00) </option>

                    <option value="Pacific/Kwajalein">Kwajalein, Eniwetok, International Date Line West (-12:00) </option>
                    <option value="America/Tijuana">Tijuana, Baja California (-8:00) </option>
                    <option value="America/Chihuahua">Chihuahua, La Paz, Mazatlan (-7:00) </option>
                    <option value="America/Mexico_City">Guadalajara, Mexico City, Monterrey (-6:00) </option>
                    <option value="Canada/Saskatchewan">Saskatchewan (-6:00) </option>
                    <option value="America/Lima">Bogota, Lima, Quito, Rio Branco (-5:00) </option>

                    <option value="America/Caracas">Caracas (-4:00)</option>
                    <option value="America/Santiago">Santiago (-4:00) </option>
                    <option value="America/Manaus">Manaus (-4:00) </option>
                    <option value="America/St_Johns">Newfoundland (-3:30) </option>
                    <option value="America/Montevideo">Montevideo (-3:00)</option>
                    <option value="America/Sao_Paulo">Brasilia Sao_Paulo (-3:00) </option>
                    <option value="America/Godthab">Greenland (-3:00) </option>
                    <option value="America/Argentina/Buenos_Aires">Buenos Aires (-3:00) </option>
                    <option value="America/Noronha">Atlantic Islands (-2:00) </option>
                    <option value="Atlantic/Azores">Azores (-1:00) </option>
                    <option value="Atlantic/Cape_Verde">Cape Verde (-1:00) </option>

                    <option value="Europe/London">London, Dublin, Edinburgh, Lisbon (GMT)</option>
                    <option value="Africa/Casablanca">Casablanca, Monrovia (GMT)</option>
                    <option value="Atlantic/Reykjavik">Reykjavik (GMT)</option>
                    <option value="Europe/Warsaw">Sarajevo, Skopje, Warsaw, Zagreb (+1:00) </option>
                    <option value="Europe/Brussels">Brussels, Copenhagen, Madrid, Paris (+1:00)</option>
                    <option value="Europe/Belgrade">Belgrade, Bratislava, Budapest, Ljubljana, Prague (+1:00)</option>
                    <option value="Europe/Amsterdam">Amsterdam, Berlin, Rome, Bern, Stockholm, Vienna (+1:00)</option>
                    <option value="Africa/Cairo">Cairo (+2:00)</option>
                    <option value="Europe/Helsinki">Helsinki, Kyiv, Riga, Sofia, Tallin, Vilnius (+2:00)</option>
                    <option value="Europe/Athens">Athens, Bucharest (+2:00)</option>

                    <option value="Asia/Jerusalem">Jerusalem, Amman, Beirut (+2:00)</option>
                    <option value="Africa/Harare">Harare, Pretoria (+2:00)</option>
                    <option value="Africa/Windhoek">Windhoek (+2:00)</option>
                    <option value="Europe/Istanbul">Istanbul (+3:00)</option>
                    <option value="Asia/Baghdad">Baghdad (+3:00)</option>
                    <option value="Asia/Riyadh">Kuwait, Riyadh (+3:00)</option>
                    <option value="Europe/Minsk">Minsk (+3:00/+3:00)</option>
                    <option value="Africa/Nairobi">Nairobi (+3:00)</option>
                    <option value="Europe/Moscow">Moscow, St Petersburg, Volgograd (+3:00)</option>

                    <option value="Asia/Tehran">Tehran (+3:30)</option>
                    <option value="Asia/Tbilisi">Tbilisi (+4:00)</option>

                    <option value="Asia/Baku">Baku (+4:00)</option>
                    <option value="Asia/Muscat">Abu Dhabi, Muscat (+4:00)</option>
                    <option value="Asia/Yerevan">Yerevan (+4:00)</option>

                    <option value="Asia/Kabul">Kabul (+4:30)</option>

                    <option value="Asia/Yekaterinburg">Yekaterinburg (+5:00)</option>
                    <option value="Asia/Karachi">Islamabad, Karachi, Tashkent (+5:00)</option>

                    <option value="Asia/Kolkata">Kolkata, Chennai, Mumbai, New Delhi (+5:30)</option>

                    <option value="Asia/Kathmandu">Kathmandu (+5:45)</option>

                    <option value="Asia/Almaty">Almaty, Dhaka (+6:00)</option>

                    <option value="Asia/Yangon">Yangon (Rangoon) (+6:30)</option>

                    <option value="Asia/Novosibirsk">Novosibirsk (+7:00)</option>
                    <option value="Asia/Bangkok">Bangkok, Hanoi, Jakarta, Krasnoyarsk (+7:00)</option>

                    <option value="Asia/Irkutsk">Irkutsk, Ulaan Bataar, Kuala Lumpur (+8:00)</option>
                    <option value="Asia/Singapore">Singapore (+8:00)</option>

                    <option value="Asia/Shanghai">Shanghai, Beijing, Chongqing, Hong Kong, Urumqi (+8:00)</option>

                    <option value="Asia/Taipei">Taipei (+8:00)</option>
                    <option value="Australia/Perth">Perth (+8:00)</option>

                    <option value="Asia/Seoul">Seoul (+9:00)</option>
                    <option value="Asia/Tokyo">Tokyo, Osaka, Sapporo (+9:00)</option>
                    <option value="Asia/Yakutsk">Yakutsk (+9:00)</option>

                    <option value="Australia/Adelaide">Adelaide (+9:30)</option>
                    <option value="Australia/Darwin">Darwin (+9:30)</option>

                    <option value="Pacific/Guam">Guam, Port Moresby (+10:00)</option>
                    <option value="Australia/Hobart">Hobart, Tasmania (+10:00)</option>
                    <option value="Asia/Vladivostok">Vladivostok (+10:00)</option>
                    <option value="Australia/Sydney">Sydney, Melbourne, Canberra, NSW (+10:00)</option>
                    <option value="Australia/Brisbane">Brisbane (+10:00)</option>

                    <option value="Asia/Magadan">Magadan, Solomon Islands, New Caledonia (+11:00)</option>

                    <option value="Pacific/Fiji">Fiji (+12:00)</option>
                    <option value="Asia/Kamchatka">Kamchatka, Marshall Islands (+12:00)</option>
                    <option value="Pacific/Auckland">Auckland, Wellington (+12:00)</option>
                    <option value="Pacific/Tongatapu">Tongatapu (+13:00)</option>
                  </Form.Control>
                </Form.Group>


                <Form.Group>
                  <Form.Label>Start Day</Form.Label>
                  <Form.Control onChange={this.changeHandler} className="w-50" as="select" name="startDay">
                    <option value="01">1</option>
                    <option value="02">2</option>
                    <option value="03">3</option>
                    <option value="04">4</option>
                    <option value="05">5</option>
                    <option value="06">6</option>
                    <option value="07">7</option>
                    <option value="08">8</option>
                    <option value="09">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">14</option>
                    <option value="15">15</option>
                    <option value="16">16</option>
                    <option value="17">17</option>
                    <option value="18">18</option>
                    <option value="19">19</option>
                    <option value="20">20</option>
                    <option value="21">21</option>
                    <option value="22">22</option>
                    <option value="23">23</option>
                    <option value="24">24</option>
                    <option value="25">25</option>
                    <option value="26">26</option>
                    <option value="27">27</option>
                    <option value="28">28</option>
                    <option value="29">29</option>
                    <option value="30">30</option>
                    <option value="31">31</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Start Month</Form.Label>
                  <Form.Control onChange={this.changeHandler} className="w-50" as="select" name="startMonth">
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Start Year</Form.Label>
                  <Form.Control onChange={this.changeHandler} className="w-50" as="select" name="startYear">
                    <option value="2019">2019</option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Start Hour</Form.Label>
                  <Form.Control onChange={this.changeHandler} className="w-50" as="select" name="startHour">
                    <option value="00">00</option>
                    <option value="01">01</option>
                    <option value="02">02</option>
                    <option value="03">03</option>
                    <option value="04">04</option>
                    <option value="05">05</option>
                    <option value="06">06</option>
                    <option value="07">07</option>
                    <option value="08">08</option>
                    <option value="09">09</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">14</option>
                    <option value="15">15</option>
                    <option value="16">16</option>
                    <option value="17">17</option>
                    <option value="18">18</option>
                    <option value="19">19</option>
                    <option value="20">20</option>
                    <option value="21">21</option>
                    <option value="22">22</option>
                    <option value="23">23</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Start Minutes</Form.Label>
                  <Form.Control onChange={this.changeHandler} className="w-50" as="select" name="startMinutes">
                    <option value="00">00</option>
                    <option value="05">05</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                    <option value="30">30</option>
                    <option value="35">35</option>
                    <option value="40">40</option>
                    <option value="45">45</option>
                    <option value="50">50</option>
                    <option value="55">55</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group>
                  <Form.Label>End Day</Form.Label>
                  <Form.Control onChange={this.changeHandler} className="w-50" as="select" name="endDay">
                    <option value="01">1</option>
                    <option value="02">2</option>
                    <option value="03">3</option>
                    <option value="04">4</option>
                    <option value="05">5</option>
                    <option value="06">6</option>
                    <option value="07">7</option>
                    <option value="08">8</option>
                    <option value="09">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">14</option>
                    <option value="15">15</option>
                    <option value="16">16</option>
                    <option value="17">17</option>
                    <option value="18">18</option>
                    <option value="19">19</option>
                    <option value="20">20</option>
                    <option value="21">21</option>
                    <option value="22">22</option>
                    <option value="23">23</option>
                    <option value="24">24</option>
                    <option value="25">25</option>
                    <option value="26">26</option>
                    <option value="27">27</option>
                    <option value="28">28</option>
                    <option value="29">29</option>
                    <option value="30">30</option>
                    <option value="31">31</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group>
                  <Form.Label>End Month</Form.Label>
                  <Form.Control onChange={this.changeHandler} className="w-50" as="select" name="endMonth">
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group>
                  <Form.Label>End Year</Form.Label>
                  <Form.Control onChange={this.changeHandler} className="w-50" as="select" name="endYear">
                    <option value="2019">2019</option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group>
                  <Form.Label>End Hour</Form.Label>
                  <Form.Control onChange={this.changeHandler} className="w-50" as="select" name="endHour">
                    <option value="00">00</option>
                    <option value="01">01</option>
                    <option value="02">02</option>
                    <option value="03">03</option>
                    <option value="04">04</option>
                    <option value="05">05</option>
                    <option value="06">06</option>
                    <option value="07">07</option>
                    <option value="08">08</option>
                    <option value="09">09</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">14</option>
                    <option value="15">15</option>
                    <option value="16">16</option>
                    <option value="17">17</option>
                    <option value="18">18</option>
                    <option value="19">19</option>
                    <option value="20">20</option>
                    <option value="21">21</option>
                    <option value="22">22</option>
                    <option value="23">23</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group>
                  <Form.Label>End Minutes</Form.Label>
                  <Form.Control onChange={this.changeHandler} className="w-50" as="select" name="endMinutes">
                    <option value="00">00</option>
                    <option value="05">05</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                    <option value="30">30</option>
                    <option value="35">35</option>
                    <option value="40">40</option>
                    <option value="45">45</option>
                    <option value="50">50</option>
                    <option value="55">55</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Event Description</Form.Label>
                  <Form.Control className="w-50" onChange={this.changeHandler} as="textarea" rows="3" type="text" name="eventDescription" placeholder="Enter event description & address or web address" required />
                </Form.Group>

                {this.state.errMessage ? <p className="text-danger py-3">{this.state.errMessage}</p> : ''}

                <Button variant="primary" type="submit">
                  Submit
              </Button>
              </Form>


            </div>
          </div>
        }
      </div>
    )
  }
}
export default MainContent 
