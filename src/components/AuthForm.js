import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom"; // импортируем навигацию
import "./AuthForm.css"; // Подключаем стили

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // хук для переходов

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        setStatus("✅ Регистрация успешна!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setStatus("✅ Вход выполнен успешно!");
      }

      // 👉 после успешной регистрации/входа переброс на главную
      navigate("/");
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
