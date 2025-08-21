// src/components/AuthForm.js
import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      if (isRegister) {
        // 👉 регистрация
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // 👉 отправляем письмо подтверждения
        await sendEmailVerification(user);
        setStatus("📩 На вашу почту отправлено письмо для подтверждения!");

        // 👉 сразу выходим из аккаунта, чтобы юзер не попал в приложение без подтверждения
        await signOut(auth);
      } else {
        // 👉 вход
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        if (!user.emailVerified) {
          setStatus("⚠️ Подтвердите почту перед входом!");
          await signOut(auth);
          return;
        }

        setStatus("✅ Вход выполнен успешно!");
        navigate("/"); // переход на главную только если email подтвержден
      }
    } catch (err) {
      setStatus("❌ Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-container'>
      <div className='auth-box'>
        <h2>{isRegister ? "Регистрация" : "Вход"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type='email'
            placeholder='Введите email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type='password'
            placeholder='Введите пароль'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type='submit' disabled={loading}>
            {loading
              ? "Загрузка..."
              : isRegister
              ? "Зарегистрироваться"
              : "Войти"}
          </button>
        </form>

        <p className='switch'>
          {isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Войти" : "Регистрация"}
          </span>
        </p>

        {status && <p className='status'>{status}</p>}
      </div>
    </div>
  );
}
