import { Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import '../index.css'
import { Toaster } from 'sonner'
import UserProtector from "./services/userProtector";
import CalendarEvents from "./pages/Calender";



function App() {
  return (
    <>
    <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path = '/calendar' element= {<UserProtector> <CalendarEvents /> </UserProtector>} />
      
      </Routes>

 
    </>
  );
}

export default App;