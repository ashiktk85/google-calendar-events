import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "sonner";
import { BASE_URL } from "../credentials";
import "./styles.css"; 
import { useNavigate } from "react-router-dom";

export default function CalendarEvents() {
  const { name, email, picture } = JSON.parse(localStorage.getItem("user"));
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(
        ` http://localhost:3001/events/get-events/${email}`
      );
      console.log(data);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const initialValues = { name: "", date: "", time: "" };

  const validationSchema = Yup.object({
    name: Yup.string().required("Event name is required"),
    date: Yup.string().required("Date is required"),
    time: Yup.string().required("Time is required"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const response = await axios.post(`${BASE_URL}/events/create`, {
        values,
        email,
      });

      if (response.data) {
        await fetchEvents();
        resetForm();
        setIsPopupOpen(false);
        toast.success("Event added");
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <div className="modern-container">
      <header className="modern-header">
        <h1 className="logo-font">G-Calander</h1>
        <div className="modern-dropdown">
          <button className="modern-dropdown-button">English (US)</button>
          <ul className="modern-dropdown-content">
            <li>English (US)</li>
            <li>Español</li>
            <li>Français</li>
          </ul>
        </div>
      </header>
      <div className="main-parent">
        <div className="container">
          <div className="profile-card">
            <div className="profile-content">
              <div className="profile-image">
                <img src={picture} alt="{name}'s profile" />
              </div>

              <div className="profile-info">
                <h2>{name}</h2>
              </div>

              <div className="profile-stats">
                <h1>{email}</h1>
              </div>

              <div className="action-buttons">
                <button onClick={() => navigate('/')}>Back to Login</button>
              </div>
            </div>
          </div>
          <div className="modern-create-event-button">
            <button onClick={() => setIsPopupOpen(true)}>
              Create Calendar Event
            </button>
          </div>
        </div>

        {isPopupOpen && (
          <div className="modern-popup-overlay">
            <div className="modern-popup">
              <div className="modern-popup-header">
                <span>Create Calendar Event</span>
                <button onClick={() => setIsPopupOpen(false)}>X</button>
              </div>
              <div className="modern-popup-content">
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form className="modern-form">
                      <div className="modern-form-group">
                        <label htmlFor="name">Event Name</label>
                        <Field
                          id="name"
                          name="name"
                          className="modern-form-input"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="modern-form-error"
                        />
                      </div>
                      <div className="modern-form-group">
                        <label htmlFor="date">Date</label>
                        <Field
                          id="date"
                          name="date"
                          type="date"
                          className="modern-form-input"
                        />
                        <ErrorMessage
                          name="date"
                          component="div"
                          className="modern-form-error"
                        />
                      </div>
                      <div className="modern-form-group">
                        <label htmlFor="time">Time</label>
                        <Field
                          id="time"
                          name="time"
                          type="time"
                          className="modern-form-input"
                        />
                        <ErrorMessage
                          name="time"
                          component="div"
                          className="modern-form-error"
                        />
                      </div>
                      <button
                        type="submit"
                        className="modern-form-button"
                        disabled={isSubmitting}
                      >
                        Create Event
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        )}

        {events.length > 0 ? (
          <div className="modern-events-section">
            <div className="modern-card">
              <div className="modern-card-header">Event List</div>
              <div className="modern-card-content">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Date</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event, index) => {
                      const startDate = new Date(event.startTime);
                      const endDate = new Date(event.endTime);  

                     
                      const formattedDate = new Intl.DateTimeFormat("en-US", {
                        weekday: "long", 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric", 
                      }).format(startDate);

                      const formattedStartTime = new Intl.DateTimeFormat("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      }).format(startDate);

                      const formattedEndTime = new Intl.DateTimeFormat("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      }).format(endDate);

                      const formattedTimeRange = `${formattedStartTime} - ${formattedEndTime}`;

                      return (
                        <tr key={index}>
                          <td>{event.name}</td>
                          <td>{formattedDate}</td>
                          <td>{formattedTimeRange}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="modern-no-events">No events yet</p>
        )}
      </div>
    </div>
  );
}
