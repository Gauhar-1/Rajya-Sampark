import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export interface PhoneFormData {
    phone: string;
}

export interface OtpFormData {
    otp: string;
}

export const useLogin = () => {
    const { toast } = useToast();
    const { loginWithOtp } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser."));
            } else {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    () => {
                        reject(new Error("Unable to retrieve your location. Login will proceed without it."));
                    }
                )
            }
        })
    }

    const handleSendOtp = async (data: PhoneFormData) => {
        setIsLoading(true);
        let locationData = null;

        try {
            locationData = await getCurrentLocation();
            console.log("Location obtained:", locationData);
        } catch (locationError) {
            console.log(locationError);
        }

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_NEXT_API_URL}/auth/send-otp`, { data, locationData });

            if (response.data.success) {
                // Check for nested data structure as per request
                const responseData = response.data.data || response.data;

                toast({
                    title: response.data.message,
                    description: `Enter the code ${responseData.otp} to log in.`,
                });

                setPhoneNumber(data.phone);
                setIsOtpSent(true);
            } else {
                toast({
                    title: "Error",
                    description: response.data.message || "Failed to send OTP",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while sending OTP",
                variant: "destructive"
            })
            console.error(error);
        } finally {
            setIsLoading(false);
        }
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

    return {
        isLoading,
        isOtpSent,
        phoneNumber,
        handleSendOtp,
        handleVerifyOtp
    };
};
