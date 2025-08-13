import React from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/"); // после входа перенаправляем на главную
  };

  return <AuthForm onLogin={handleLoginSuccess} />;
};

export default LoginPage;
