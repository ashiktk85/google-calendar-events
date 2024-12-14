import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FcGoogle } from "react-icons/fc"
import { IoLanguage } from "react-icons/io5"
import { HiOutlineExternalLink } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import { useGoogleLogin } from "@react-oauth/google"
import axios from "axios"
import { toast } from "sonner"
import { BASE_URL } from "../credentials"

const SignIn = () => {

    const navigate = useNavigate()
    
    const handleGoogleAuth = useGoogleLogin({
      onSuccess: async (codeResponse) => {
          console.log(codeResponse);    
  
          const { code } = codeResponse;
          try {
              const { data } = await axios.post(`${BASE_URL}/auth/google`, { code });
              console.log(data);
  
              localStorage.setItem('user', JSON.stringify(data));
  
              if (data) {
                toast.success("Logged In")
                setTimeout(() => {

                  navigate('/calendar');
                },1000)
              }
          } catch (error) {
              console.error('Error during Google login:', error);
              toast.error('Login failed');
          }
      },
      onError: () => toast.error('Login failed'),
      flow: 'auth-code',
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/calendar',
  });
  
  

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
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
      <main className="flex items-center justify-center flex-grow px-4 ">
        <Card className="w-full max-w-md bg-white h-[300px] items-center">
          <CardHeader className="space-y-10">
            <CardTitle className="text-2xl font-bold text-center ">Sign in</CardTitle>
            <CardDescription className="text-center">
              Use your Google account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Button 
            onClick = {handleGoogleAuth}
            className="w-full max-w-sm hover:bg-black hover:text-white" variant="border" size="xl">
              <FcGoogle className="w-5 h-5 mr-2" />
              Sign in with Google
            </Button>
          
            {/* <Button className="w-full max-w-sm" variant="secondary">
              Create an account
            </Button> */}
          </CardContent>
          <CardFooter className="flex flex-col items-center text-sm text-gray-500">
            <p>By continuing, you agree to our</p>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="flex items-center hover:text-primary">
                Terms of Service
                <HiOutlineExternalLink className="ml-1 w-4 h-4" />
              </a>
              <a href="#" className="flex items-center hover:text-primary">
                Privacy Policy
                <HiOutlineExternalLink className="ml-1 w-4 h-4" />
              </a>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

export default SignIn;