import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { IoLanguage } from "react-icons/io5"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { BASE_URL } from '../credentials'
import { toast } from 'sonner'
import axios from 'axios'

export default function CalendarEvents() {
  const { name, email } = JSON.parse(localStorage.getItem('user'));
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [events, setEvents] = useState([]);
  
  const fetchEvents = async () => {
    try {
      const {data} = await axios.get(`${BASE_URL}/events/get-events/${email}`)
      setEvents(data)
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const initialValues = { name: '', date: '', time: '' };
  
  const validationSchema = Yup.object({
    name: Yup.string().required("Event name is required"),
    date: Yup.string().required("Date is required"),
    time: Yup.string().required("Time is required"),
  });
  
  const handleSubmit = async (values, { resetForm }) => {
    try {
      const response = await axios.post(`${BASE_URL}/events/create`, {
       values ,email
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
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between p-4 bg-black shadow-sm mb-10 rounded-md text-white">
        <div className="w-24 h-8 bg-gray-200 rounded-md" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <IoLanguage className="w-5 h-5 mr-2" />
              English (US)
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>English (US)</DropdownMenuItem>
            <DropdownMenuItem>Español</DropdownMenuItem>
            <DropdownMenuItem>Français</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      
      <div className="flex justify-center">
        <Card className="mb-8 w-1/4 items-center">
          <CardHeader>
            <CardTitle>Profile Card</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-bold">{name}</h2>
                <p className="text-gray-500">{email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button onClick={() => setIsPopupOpen(true)} className="bg-black text-white">
          Create Calendar Event
        </Button>
      </div>
      
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 bg-white">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Create Calendar Event
                <Button variant="ghost" size="icon" onClick={() => setIsPopupOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <div>
                      <Label htmlFor="name">Event Name</Label>
                      <Field as={Input} id="name" name="name" />
                      <ErrorMessage name="name" component="div" className="text-red-500" />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Field as={Input} id="date" name="date" type="date" />
                      <ErrorMessage name="date" component="div" className="text-red-500" />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Field as={Input} id="time" name="time" type="time" />
                      <ErrorMessage name="time" component="div" className="text-red-500" />
                    </div>
                    <Button type="submit" className="w-full bg-black text-white" disabled={isSubmitting}>
                      Create Event
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </div>
      )}
      
      {events.length > 0 ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Event List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <p className="mt-8 text-center text-black font-bold">No events yet</p>
      )}
    </div>
  );
}
