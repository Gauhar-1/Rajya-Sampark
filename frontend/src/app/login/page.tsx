'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios from "axios";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';

const phoneSchema = z.object({
  phone: z.string().refine(val => /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val), {
    message: "Please enter a valid phone number."
  }),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits.").max(6, "OTP must be 6 digits."),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const { loginWithOtp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const getCurrentLocation = ()=>{
    return new Promise((resolve, reject)=>{
      if(!navigator.geolocation){
        reject(new Error("Geolocation is not supported by your browser."));
      } else{
        navigator.geolocation.getCurrentPosition(
          (position) =>{
            resolve({
              latitude : position.coords.latitude,
              longitude: position.coords.longitude, 
            });
          },
          ()=>{
            reject(new Error("Unable to retrieve your location. Login will proceed without it."));
          }
        )
      }
    })
  }

  const handleSendOtp = async (data: PhoneFormData) => {
    setIsLoading(true);
    let locationData = null;

    try{
      locationData = await getCurrentLocation();
      console.log("Location obtained:", locationData);
    }catch(locationError) {
      console.log(locationError);
    }

    const response = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/auth/send-otp`, {data , locationData});

    if(response.data.success){
      toast({
        title: response.data.message,
        description: `Enter the code ${response.data.otp} to log in.`,
      });
    }
    
    
    setPhoneNumber(data.phone);
    setIsOtpSent(true);
    setIsLoading(false);
  };
  
  const handleVerifyOtp = async (data: OtpFormData) => {
    setIsLoading(true);
    try {
      await loginWithOtp(phoneNumber, data.otp);
    } catch (error) {
       toast({
        title: 'An Error Occurred',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
      <div className="flex min-h-[calc(100vh-10rem)] px-6 rounded-lg  min-w-full items-center bg-primary shadow-2xl  justify-center">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center">
              <KeyRound className="mr-2 h-6 w-6" />
              {isOtpSent ? 'Enter OTP' : 'Sign In'}
            </CardTitle>
            <CardDescription>
              {isOtpSent ? `We sent a code to ${phoneNumber}.` : 'Enter your phone number to receive a login code.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isOtpSent && (
              <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="space-y-4">
                <div>
                  <Input 
                    {...phoneForm.register('phone')} 
                    placeholder="e.g., 555-123-4567"
                    type="tel"
                  />
                  {phoneForm.formState.errors.phone && <p className="text-sm text-destructive mt-1">{phoneForm.formState.errors.phone.message}</p>}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Send Code'}
                </Button>
              </form>
            )}
            { isOtpSent && (
              <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                <Controller 
                control={otpForm.control} 
                name="otp"
                rules={{ required: "OTP is required.", minLength: { value: 6, message: "OTP must be 6 digits." } }} // Optional validation
      render={({ field, fieldState: { error } }) => (
        <>
        <InputOTP maxLength={6} {...field}>
                <InputOTPGroup>
                      <InputOTPSlot index={0} className=' border border-black' />
                      <InputOTPSlot index={1}  className=' border-r-0 border-l-0 border-black'/>
                      <InputOTPSlot index={2}  className=' border border-black'/>
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                      <InputOTPSlot index={3}  className=' border border-black'/>
                      <InputOTPSlot index={4}  className=' border-r-0 border-l-0 border-black'/>
                      <InputOTPSlot index={5}  className=' border border-black'/>
                </InputOTPGroup>
              </InputOTP>
              {error && <p className="text-red-500 text-sm">{error.message}</p>}
        </>
      )}  />
              
              <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Verify Code'}
                </Button>
              </form>

            )}
          </CardContent>
        </Card>
      </div>
  );
}
