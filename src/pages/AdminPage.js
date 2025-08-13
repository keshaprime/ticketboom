import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const AdminPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    const querySnapshot = await getDocs(collection(db, "tickets"));
    const ticketsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTickets(ticketsData);
    setLoading(false);
  };

  const makePremium = async (ticketId) => {
    await updateDoc(doc(db, "tickets", ticketId), { premium: true });
    alert("✅ Билет стал премиум!");
    fetchTickets();
  };

  const removeTicket = async (ticketId) => {
    await updateDoc(doc(db, "tickets", ticketId), { deleted: true });
    alert("❌ Билет помечен как удалённый");
    fetchTickets();
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading)
    return <h3 style={{ textAlign: "center" }}>Загрузка билетов...</h3>;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <h2>Админка TicketBoom</h2>
      <p>Подтверждай премиум-билеты и управляй контентом</p>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead>
          <tr style={{ background: "#f1f1f1" }}>
            <th style={styles.th}>Концерт</th>
            <th style={styles.th}>Город</th>
            <th style={styles.th}>Цена</th>
            <th style={styles.th}>Премиум</th>
            <th style={styles.th}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              style={{ background: ticket.premium ? "#fffbe6" : "#fff" }}
            >
              <td style={styles.td}>{ticket.concertName}</td>
              <td style={styles.td}>{ticket.city}</td>
              <td style={styles.td}>{ticket.price} ₼</td>
              <td style={styles.td}>{ticket.premium ? "✅" : "❌"}</td>
              <td style={styles.td}>
                {!ticket.premium && (
                  <button
                    style={styles.button}
                    onClick={() => makePremium(ticket.id)}
                  >
                    Сделать премиум
                  </button>
                )}
                <button
                  style={{ ...styles.button, background: "#ff4d4d" }}
                  onClick={() => removeTicket(ticket.id)}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  th: {
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "left",
  },
  td: {
    padding: "10px",
    border: "1px solid #ddd",
  },
  button: {
    padding: "6px 12px",
    marginRight: "6px",
    background: "#ffd700",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default AdminPage;
