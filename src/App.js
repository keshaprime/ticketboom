import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import HomePage from "./pages/HomePage";
import AddTicketPage from "./pages/AddTicketPage";
import LoginPage from "./pages/LoginPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import AdminPage from "./pages/AdminPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";

// ✅ react-toastify для уведомлений
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    showInfoToast("Вы вышли из аккаунта");
  };

  // ✅ Общие функции уведомлений
  const toastConfig = {
    position: "top-right",
    autoClose: 3000, // закрывается через 3 сек
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  };

  const showSuccessToast = (message) => {
    toast.success(message, toastConfig);
  };

  const showErrorToast = (message) => {
    toast.error(message, toastConfig);
  };

  const showInfoToast = (message) => {
    toast.info(message, toastConfig);
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Загрузка...</h2>;

  return (
    <Router>
      <div style={styles.page}>
        {/* Шапка */}
        <header style={styles.header}>
          <Link to='/' style={styles.logo}>
            TicketBoom
          </Link>
          <nav style={styles.nav}>
            <Link to='/' style={styles.link}>
              Главная
            </Link>
            {user && user.emailVerified && (
              <Link to='/add' style={styles.link}>
                Добавить билет
              </Link>
            )}
            {user && user.emailVerified && (
              <Link to='/mytickets' style={styles.link}>
                Мои билеты
              </Link>
            )}
            {user?.email === "salimlikerim5@gmail.com" &&
              user.emailVerified && (
                <Link to='/admin' style={styles.link}>
                  Админка
                </Link>
              )}
            {!user ? (
              <Link to='/login' style={styles.link}>
                Войти
              </Link>
            ) : (
              <button onClick={handleLogout} style={styles.logout}>
                Выйти
              </button>
            )}
          </nav>
        </header>

        {/* Контейнер тостов */}
        <ToastContainer />

        {/* Контент */}
        <div style={styles.content}>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route
              path='/add'
              element={
                user && user.emailVerified ? (
                  <AddTicketPage
                    user={user}
                    showSuccessToast={showSuccessToast}
                    showErrorToast={showErrorToast}
                  />
                ) : (
                  <Navigate to='/login' />
                )
              }
            />
            <Route
              path='/mytickets'
              element={
                user && user.emailVerified ? (
                  <MyTicketsPage user={user} />
                ) : (
                  <Navigate to='/login' />
                )
              }
            />
            <Route
              path='/admin'
              element={
                user?.email === "salimlikerim5@gmail.com" &&
                user.emailVerified ? (
                  <AdminPage />
                ) : (
                  <Navigate to='/login' />
                )
              }
            />
            <Route
              path='/login'
              element={
                <LoginPage
                  showSuccessToast={showSuccessToast}
                  showErrorToast={showErrorToast}
                />
              }
            />
            <Route path='/ticket/:id' element={<TicketDetailsPage />} />
          </Routes>
        </div>

        {/* Плавающая кнопка добавления билета */}
        {user && user.emailVerified && (
          <Link to='/add' style={styles.fab}>
            +
          </Link>
        )}

        {/* Футер */}
        <footer style={styles.footer}>
          © 2025 TicketBoom. Все права защищены.
        </footer>
      </div>
    </Router>
  );
}

const styles = {
  page: { display: "flex", flexDirection: "column", minHeight: "100vh" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    background: "#222",
    color: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  logo: {
    color: "#fff",
    fontSize: "20px",
    textDecoration: "none",
    fontWeight: "bold",
  },
  nav: { display: "flex", gap: "16px", alignItems: "center" },
  link: { color: "#fff", textDecoration: "none" },
  logout: {
    background: "transparent",
    border: "1px solid #fff",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  content: { flex: 1, paddingBottom: "40px" },
  footer: {
    textAlign: "center",
    padding: "20px 0",
    borderTop: "1px solid #ddd",
    color: "#777",
    fontSize: "14px",
    background: "#f9f9f9",
  },
  fab: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#FF5722",
    color: "#fff",
    fontSize: "28px",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
  },
};

export default App;
