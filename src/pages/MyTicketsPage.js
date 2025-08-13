import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const MyTicketsPage = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editContact, setEditContact] = useState("");

  // Загружаем билеты пользователя
  useEffect(() => {
    const fetchMyTickets = async () => {
      if (!user || !user.email) {
        setTickets([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "tickets"),
          where("userEmail", "==", user.email)
        );

        const querySnapshot = await getDocs(q);
        const myTicketsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTickets(myTicketsArray);
      } catch (error) {
        console.error("Ошибка при загрузке моих билетов:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTickets();
  }, [user]);

  // 🔹 Удаление билета
  const handleDelete = async (ticketId) => {
    const confirmDelete = window.confirm(
      "Вы уверены, что хотите удалить этот билет?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "tickets", ticketId));
      setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));
    } catch (error) {
      console.error("Ошибка при удалении билета:", error);
    }
  };

  // 🔹 Начало редактирования
  const startEditing = (ticket) => {
    setEditingTicketId(ticket.id);
    setEditPrice(ticket.price);
    setEditContact(ticket.contact);
  };

  // 🔹 Сохранение изменений
  const handleSaveEdit = async (ticketId) => {
    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        price: editPrice,
        contact: editContact,
      });

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, price: editPrice, contact: editContact }
            : ticket
        )
      );

      setEditingTicketId(null);
      alert("Изменения сохранены!");
    } catch (error) {
      console.error("Ошибка при редактировании билета:", error);
    }
  };

  // 🔹 Сделать билет премиум
  const handleMakePremium = async (ticketId) => {
    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        premiumPending: true,
      });
      alert(
        "✅ Билет отмечен для премиум.\n\nПерейдите в нашего бота @ticketboom_bot и отправьте чек оплаты.\nНе забудьте указать TicketID!"
      );
      window.open("https://t.me/ticketboom_bot", "_blank");
    } catch (error) {
      console.error("Ошибка при установке премиум:", error);
    }
  };

  // 🔹 Копирование TicketID
  const handleCopyTicketId = (ticketId) => {
    navigator.clipboard.writeText(ticketId);
    alert(`TicketID ${ticketId} скопирован!`);
  };

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>Загрузка...</h2>
    );
  }

  if (!user) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        Сначала войдите в аккаунт!
      </h2>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Мои билеты</h2>
      {tickets.length === 0 ? (
        <p>Вы еще не добавили ни одного билета.</p>
      ) : (
        <div style={styles.grid}>
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              style={{
                ...styles.card,
                border: ticket.premium ? "2px solid gold" : "1px solid #ddd",
                background: ticket.premium ? "#fffbea" : "#fff",
              }}
            >
              <h3>
                {ticket.concertName}{" "}
                {ticket.premium && <span style={{ color: "gold" }}>🌟</span>}
              </h3>

              <p>
                <strong>TicketID:</strong> {ticket.id}
              </p>
              <button
                style={styles.copyButton}
                onClick={() => handleCopyTicketId(ticket.id)}
              >
                Скопировать TicketID
              </button>

              <p>
                <strong>Город:</strong> {ticket.city}
              </p>
              <p>
                <strong>Дата:</strong> {ticket.date}
              </p>

              {editingTicketId === ticket.id ? (
                <>
                  <input
                    type='number'
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    style={styles.input}
                  />
                  <input
                    type='text'
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    style={styles.input}
                  />
                  <button
                    onClick={() => handleSaveEdit(ticket.id)}
                    style={styles.saveButton}
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setEditingTicketId(null)}
                    style={styles.cancelButton}
                  >
                    Отмена
                  </button>
                </>
              ) : (
                <>
                  <p>
                    <strong>Цена:</strong> {ticket.price} ₼
                  </p>
                  <p>
                    <strong>Контакт:</strong> {ticket.contact}
                  </p>
                  <p style={styles.owner}>Вы добавили этот билет</p>

                  {!ticket.premium && (
                    <button
                      onClick={() => handleMakePremium(ticket.id)}
                      style={styles.premiumButton}
                    >
                      Сделать премиум 🌟
                    </button>
                  )}

                  <button
                    onClick={() => startEditing(ticket)}
                    style={styles.editButton}
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    style={styles.deleteButton}
                  >
                    Удалить
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: "900px", margin: "0 auto", padding: "24px" },
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
  },
  owner: { marginTop: "8px", fontSize: "12px", color: "#555" },
  deleteButton: {
    marginTop: "10px",
    padding: "8px 12px",
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  editButton: {
    marginTop: "10px",
    marginRight: "8px",
    padding: "8px 12px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  saveButton: {
    marginTop: "10px",
    marginRight: "8px",
    padding: "8px 12px",
    backgroundColor: "#2196F3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  cancelButton: {
    marginTop: "10px",
    padding: "8px 12px",
    backgroundColor: "#aaa",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  premiumButton: {
    marginTop: "10px",
    marginRight: "8px",
    padding: "8px 12px",
    backgroundColor: "gold",
    color: "#000",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  input: {
    width: "100%",
    marginTop: "6px",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  copyButton: {
    marginTop: "6px",
    marginBottom: "10px",
    padding: "6px 10px",
    backgroundColor: "#eee",
    border: "1px solid #ccc",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default MyTicketsPage;
