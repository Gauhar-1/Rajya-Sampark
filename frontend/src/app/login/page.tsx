'use client';

import { useLogin } from './hooks/useLogin';
import { LoginForm } from './components/LoginForm';

export default function LoginPage() {
  const { isLoading, isOtpSent, phoneNumber, handleSendOtp, handleVerifyOtp } = useLogin();

  return (
    <LoginForm
      isLoading={isLoading}
      isOtpSent={isOtpSent}
      phoneNumber={phoneNumber}
      onSendOtp={handleSendOtp}
      onVerifyOtp={handleVerifyOtp}
    />
  );
}
