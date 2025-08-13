import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import { FaBell } from "react-icons/fa";

const HomePage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Фильтры
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // 🔹 Уведомления
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  // 🔹 Получение билетов
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tickets"));
        const ticketArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Премиум билеты будут выше
        const sorted = ticketArray.sort(
          (a, b) => (b.premium === true) - (a.premium === true)
        );

        setTickets(sorted);
      } catch (error) {
        console.error("Ошибка при загрузке билетов:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // 🔹 Создание тестовой коллекции уведомлений (если пусто)
  useEffect(() => {
    const initNotifications = async () => {
      const notifRef = collection(db, "notifications");
      const snap = await getDocs(notifRef);
      if (snap.empty) {
        await addDoc(notifRef, {
          text: "Добро пожаловать! 🎉",
          createdAt: new Date(),
          read: false,
        });
        await addDoc(notifRef, {
          text: "Ваш билет был успешно опубликован ✅",
          createdAt: new Date(),
          read: false,
        });
      }
    };
    initNotifications();
  }, []);

  // 🔹 Подписка на уведомления в реальном времени
  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notifData);
      setUnreadCount(notifData.filter((n) => !n.read).length);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Пометить уведомление как прочитанное
  const markAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, "notifications", notifId), { read: true });
    } catch (error) {
      console.error("Ошибка при обновлении уведомления:", error);
    }
  };

  // 🔹 Фильтруем билеты по условиям
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.concertName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = selectedCity ? ticket.city === selectedCity : true;

    const matchesPrice =
      (!minPrice || Number(ticket.price) >= Number(minPrice)) &&
      (!maxPrice || Number(ticket.price) <= Number(maxPrice));

    return matchesSearch && matchesCity && matchesPrice;
  });

  // 🔹 Города для фильтра
  const cities = [...new Set(tickets.map((ticket) => ticket.city))];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Доступные билеты</h2>

        <div style={{ position: "relative" }}>
          <FaBell
            size={28}
            style={{ cursor: "pointer" }}
            onClick={() => setShowNotifs(!showNotifs)}
          />
          {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}

          {showNotifs && (
            <div style={styles.dropdown}>
              {notifications.length === 0 ? (
                <p style={{ padding: 10 }}>Нет уведомлений</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      ...styles.notificationItem,
                      backgroundColor: n.read ? "#fff" : "#f0f8ff",
                      cursor: "pointer",
                    }}
                    onClick={() => markAsRead(n.id)}
                  >
                    <p style={{ margin: 0 }}>{n.text}</p>
                    <small style={{ color: "#777" }}>
                      {n.createdAt?.toDate
                        ? n.createdAt.toDate().toLocaleString()
                        : n.createdAt.toLocaleString()}
                    </small>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </header>

      {/* 🔹 Панель фильтров */}
      <div style={styles.filterContainer}>
        <input
          type='text'
          placeholder='Поиск по событию или городу'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.input}
        />

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          style={styles.input}
        >
          <option value=''>Все города</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <input
          type='number'
          placeholder='Мин. цена'
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={styles.input}
        />
        <input
          type='number'
          placeholder='Макс. цена'
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* 🔹 Список билетов */}
      {loading ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>Загрузка...</p>
      ) : filteredTickets.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Билеты не найдены.
        </p>
      ) : (
        <div style={styles.grid}>
          {filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/ticket/${ticket.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  ...styles.card,
                  background: ticket.premium ? "#fff8dc" : "#fff",
                  border: ticket.premium
                    ? "2px solid #FFD700"
                    : "1px solid #ddd",
                }}
              >
                <h3>{ticket.concertName}</h3>
                <p>
                  <strong>Город:</strong> {ticket.city}
                </p>
                <p>
                  <strong>Дата:</strong> {ticket.date}
                </p>
                <p>
                  <strong>Цена:</strong> {ticket.price} ₼
                </p>
                <p>
                  <strong>Контакт:</strong> {ticket.contact}
                </p>
                {ticket.premium && (
                  <p style={{ color: "#DAA520", fontWeight: "bold" }}>
                    🌟 Премиум
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: "1000px", margin: "0 auto", padding: "24px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    background: "red",
    color: "white",
    borderRadius: "50%",
    padding: "2px 6px",
    fontSize: 12,
  },
  dropdown: {
    position: "absolute",
    top: 35,
    right: 0,
    width: 250,
    background: "white",
    border: "1px solid #ccc",
    borderRadius: 5,
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    zIndex: 10,
    maxHeight: 300,
    overflowY: "auto",
  },
  notificationItem: {
    padding: 10,
    borderBottom: "1px solid #eee",
  },
  filterContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    flex: "1",
    minWidth: "150px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "16px",
    marginTop: "20px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    background: "#fff",
    transition: "0.2s",
  },
};

export default HomePage;
