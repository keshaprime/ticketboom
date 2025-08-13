import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  // ✅ Единая функция показа уведомлений с автоисчезновением
  const showToast = (message, type = "success") => {
    toast[type](message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowResend(false);
    setLoading(true);

    try {
      if (isRegister) {
        // Регистрация
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await sendEmailVerification(userCredential.user);
        showToast("📧 Письмо для подтверждения отправлено! Проверьте e-mail.");
        setShowResend(true);
      } else {
        // Вход
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        if (!userCredential.user.emailVerified) {
          await signOut(auth);
          showToast("❌ E-mail не подтверждён. Проверьте почту.", "error");
          setShowResend(true);
          return;
        }

        showToast("✅ Вход выполнен!");
        if (onLogin) onLogin();
      }
    } catch (err) {
      console.error(err);
      showToast(`Ошибка: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        showToast("📧 Письмо отправлено повторно!");
      } else {
        showToast("Сначала войдите или зарегистрируйтесь.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast(`Ошибка: ${err.message}`, "error");
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isRegister ? "Регистрация" : "Вход"}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type='password'
          placeholder='Пароль'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type='submit' style={styles.button} disabled={loading}>
          {loading
            ? "⏳ Загрузка..."
            : isRegister
            ? "Зарегистрироваться"
            : "Войти"}
        </button>
      </form>

      {showResend && (
        <button
          onClick={handleResendVerification}
          style={{
            ...styles.button,
            backgroundColor: "#2196F3",
            marginTop: "10px",
          }}
          disabled={loading}
        >
          📩 Отправить письмо снова
        </button>
      )}

      <p style={{ marginTop: "15px" }}>
        {isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Войти" : "Зарегистрироваться"}
        </span>
      </p>

      {/* ✅ Контейнер тостов */}
      <ToastContainer />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "80px auto",
    padding: "24px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    textAlign: "center",
    transition: "all 0.3s ease-in-out",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "16px",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    transition: "0.2s",
  },
  button: {
    padding: "12px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background 0.3s ease",
  },
};

export default AuthForm;
