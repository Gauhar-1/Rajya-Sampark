
'use client';

import type { User, Role } from '@/types';
import { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { verify } from 'crypto';
import { useToast } from '@/hooks/use-toast';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: User | null;
  role: Role;
  token: String | null
  isLoading: boolean;
  loginWithOtp: (phone: string, otp: string) =>void; // Updated for simulated login
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [appUser, setAppUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>('ANONYMOUS');
   const [isLoading, setIsLoading] = useState(false); // Start as true until we check session
   const [userId, setUserId] = useState<string | null>(null);
   const [ token, setToken ] = useState<string | null>(null);
   const { toast } = useToast();
  const router = useRouter();


  // Simulate checking for an existing session on component mount
  // useEffect(() => {
  //   setIsLoading(true);
  //   try {
  //     const storedUser = localStorage.getItem('civic-connect-user');
  //     if (storedUser) {
  //       const user: User = JSON.parse(storedUser);
  //       setAppUser(user);
  //       setRole(user.role);
  //     }
  //   } catch (error) {
  //     console.error("Failed to parse user from localStorage", error);
  //     localStorage.removeItem('civic-connect-user');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, []);

   const updateUser = useCallback(async (data: Partial<User>) => {
    if (!appUser) {
      throw new Error("No user is currently logged in.");
    }
    
    // In a real app, you would update the user document in Firestore/DB here.
    // For the simulation, we'll just update the local state and localStorage.

    const updatedUser = { ...appUser, ...data };
    
    setAppUser(updatedUser);
    if(data.role) setRole(data.role);

    try {
      localStorage.setItem('civic-connect-user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to save updated user to localStorage", error);
      // Optionally revert state if session storage fails
      // setAppUser(appUser); 
    }
  }, [appUser]);

  const loginWithOtp = async (phone: string, otp: string) => {

    setIsLoading(true);
    
     const response = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/auth/verify-otp`,{
      otp,
      phone
     })

     if(response.data.success){
      const { token , profile} = response.data;
       setAppUser(profile);
       login(token);

       toast({
          title: 'Login Successful!',
          description: 'Welcome back!',
        });
        router.push('/');

        try {
        localStorage.setItem('token', token);
      } catch (error) {
        console.error("Failed to save user to localStorage", error);
      }
     }
      else {
         toast({
          title: 'Login Failed',
          description: 'The OTP you entered is incorrect. Please try again.',
          variant: 'destructive',
        });
      }
      
      setIsLoading(false);
    }

     const login = (token: string) => {
      setIsLoading(true);
    try {
       const decoded = jwtDecode<{ profile: User }>(token);
        const { profile } = decoded;
        setUserId(profile.uid || null);
        setRole(profile.role || null);
        setAppUser(profile);
        setToken(token);
    } catch (err) {
      console.error("Invalid token", err);
    }
    finally{
      setIsLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setIsLoading(true);
    setAppUser(null);
    setRole('ANONYMOUS');
    
    // Clear mock session from localStorage
    try {
      localStorage.removeItem('civic-connect-user');
    } catch (error) {
       console.error("Failed to remove user from localStorage", error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        login(token);
      } catch {
        logout(); // Clear invalid token
      }
    }
    else{
      console.log("Token not found");
    }
  }, []);
  
  return (
    <AuthContext.Provider value={{ 
      user: appUser,
      role,
      isLoading,
      loginWithOtp,
      logout,
      updateUser,
      token
       }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
