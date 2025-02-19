"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Mail, Lock, School } from "lucide-react";

const LoginOrSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    registrationNumber: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (
      !isLogin &&
      (!formData.firstName ||
        !formData.lastName ||
        !formData.registrationNumber)
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Here we would typically make an API call to authenticate/register the user
    console.log("Form submitted:", { ...formData, userType });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div>
          <img
            src="/ui-logo.jpeg"
            alt="University of Ibadan Logo"
            className="mx-auto mt-6 w-20"
          />
        </div>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin
              ? "Enter your credentials to access your account"
              : "Sign up for a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs value={userType} onValueChange={setUserType}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger
                  value="student"
                  className="flex items-center gap-2"
                >
                  <UserCircle className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger
                  value="lecturer"
                  className="flex items-center gap-2"
                >
                  <School className="h-4 w-4" />
                  Lecturer
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">
                  {userType === "student" ? "Registration Number" : "Staff ID"}
                </Label>
                <Input
                  id="registrationNumber"
                  name="registrationNumber"
                  placeholder={userType === "student" ? "214873" : "STAFF123"}
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="pl-10"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-gray-500 text-center">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Button
              variant="link"
              className="pl-1"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </Button>
          </div>
          {isLogin && (
            <Button variant="link" className="text-sm">
              Forgot your password?
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginOrSignup;

// "use client";

// import { FormEvent, useState } from "react";
// import { useRouter } from "next/navigation";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [userType, setUserType] = useState("student");
//   const [rememberMe, setRememberMe] = useState(false);
//   const [error, setError] = useState(null);
//   const router = useRouter();

//   const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError(null);
//     try {
//       // Dummy API call for authentication
//       const response = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password, userType, rememberMe }),
//       });

//       if (!response.ok) {
//         throw new Error("Invalid credentials");
//       }
//       router.push("/dashboard");
//     } catch (err: any) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
//       <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
//         <img
//           src="/ui-logo.jpeg"
//           alt="University of Ibadan Logo"
//           className="mx-auto mb-4 w-20"
//         />
//         <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
//           ClassEngage
//         </h2>
//         <p className="text-center text-gray-600 mb-6">
//           Enhance Classroom Participation
//         </p>
//         {error && (
//           <p className="text-red-500 text-sm text-center mb-4">{error}</p>
//         )}
//         <div className="flex justify-center mb-4">
//           <button
//             className={`px-4 py-2 mx-1 rounded-md ${
//               userType === "student" ? "bg-blue-600 text-white" : "bg-gray-200"
//             }`}
//             onClick={() => setUserType("student")}
//           >
//             Student
//           </button>
//           <button
//             className={`px-4 py-2 mx-1 rounded-md ${
//               userType === "lecturer" ? "bg-blue-600 text-white" : "bg-gray-200"
//             }`}
//             onClick={() => setUserType("lecturer")}
//           >
//             Lecturer
//           </button>
//         </div>
//         <form onSubmit={handleLogin}>
//           <div className="mb-4">
//             <label className="block text-gray-700">Email</label>
//             <input
//               type="email"
//               className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700">Password</label>
//             <input
//               type="password"
//               className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div className="flex items-center justify-between mb-4">
//             <label className="flex items-center text-gray-600">
//               <input
//                 type="checkbox"
//                 className="mr-2"
//                 checked={rememberMe}
//                 onChange={() => setRememberMe(!rememberMe)}
//               />
//               Remember me
//             </label>
//             <a href="#" className="text-blue-600 text-sm">
//               Forgot Password?
//             </a>
//           </div>
//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
//           >
//             Log In
//           </button>
//         </form>
//         <p className="text-center text-gray-600 mt-4">
//           Don't have an account?{" "}
//           <a href="#" className="text-blue-600">
//             Register
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "../../components/ui/button";
// import { Input } from "../../components/ui/input";
// import { Checkbox } from "@radix-ui/react-checkbox";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
// import { Lock, Mail } from "lucide-react";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [userType, setUserType] = useState("student");
//   const [rememberMe, setRememberMe] = useState(false);
//   const [error, setError] = useState(null);
//   const router = useRouter();

//   const handleLogin = async (e: any) => {
//     e.preventDefault();
//     setError(null);
//     try {
//       // Dummy API call for authentication
//       const response = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password, userType, rememberMe }),
//       });

//       if (!response.ok) {
//         throw new Error("Invalid credentials");
//       }
//       router.push("/dashboard");
//     } catch (err: any) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
//       <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
//         <img
//           src="/ui-logo.jpeg"
//           alt="University of Ibadan Logo"
//           className="mx-auto mb-4 w-20"
//         />
//         <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
//           ClassEngage
//         </h2>
//         <p className="text-center text-gray-600 mb-6">
//           Enhance Classroom Participation
//         </p>
//         {error && (
//           <p className="text-red-500 text-sm text-center mb-4">{error}</p>
//         )}
//         <Tabs
//           defaultValue="student"
//           onValueChange={setUserType}
//           className="mb-4"
//         >
//           <TabsList className="flex w-full bg-gray-100 p-1 rounded-md">
//             <TabsTrigger
//               value="student"
//               className="flex-1 p-2 text-center rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               Student
//             </TabsTrigger>
//             <TabsTrigger
//               value="lecturer"
//               className="flex-1 p-2 text-center rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               Lecturer
//             </TabsTrigger>
//           </TabsList>
//         </Tabs>
//         <form onSubmit={handleLogin}>
//           <div className="mb-4 relative">
//             <Mail className="absolute left-3 top-3 text-gray-500" />
//             <Input
//               type="email"
//               placeholder="Email"
//               className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="mb-4 relative">
//             <Lock className="absolute left-3 top-3 text-gray-500" />
//             <Input
//               type="password"
//               placeholder="Password"
//               className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div className="flex items-center justify-between mb-4">
//             <label className="flex items-center text-gray-600">
//               <Checkbox
//                 checked={rememberMe}
//                 onCheckedChange={() => setRememberMe(!rememberMe)}
//                 className="mr-2"
//               />
//               Remember me
//             </label>
//             <a href="#" className="text-blue-600 text-sm">
//               Forgot Password?
//             </a>
//           </div>
//           <Button
//             type="submit"
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
//           >
//             Log In
//           </Button>
//         </form>
//         <p className="text-center text-gray-600 mt-4">
//           Don't have an account?{" "}
//           <a href="#" className="text-blue-600">
//             Register
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }
