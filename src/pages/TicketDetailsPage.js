import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

const TicketDetailsPage = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const docRef = doc(db, "tickets", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTicket({ id: docSnap.id, ...docSnap.data() });
        } else {
          setTicket(null);
        }
      } catch (error) {
        console.error("Ошибка при загрузке билета:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  // 🔹 Подгружаем комментарии в реальном времени
  useEffect(() => {
    const commentsRef = collection(db, "tickets", id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [id]);

  // 🔹 Отправка комментария
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const user = auth.currentUser;
    if (!user) {
      alert("Сначала войдите в аккаунт, чтобы оставить комментарий.");
      return;
    }

    try {
      const commentsRef = collection(db, "tickets", id, "comments");
      await addDoc(commentsRef, {
        text: newComment,
        userEmail: user.email,
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Ошибка при добавлении комментария:", error);
    }
  };

  if (loading)
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>Загрузка...</h2>
    );
  if (!ticket)
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        Билет не найден
      </h2>
    );

  return (
    <div style={styles.container}>
      <h2>
        {ticket.concertName}{" "}
        {ticket.premium && <span style={{ color: "gold" }}>🌟 Премиум</span>}
      </h2>
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
      <p style={styles.owner}>Добавил: {ticket.userEmail || "Неизвестно"}</p>

      <hr style={{ margin: "20px 0" }} />

      {/* 🔹 Комментарии */}
      <h3>Комментарии</h3>
      <div style={styles.commentsList}>
        {comments.length === 0 ? (
          <p>Комментариев пока нет. Будьте первым!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} style={styles.comment}>
              <strong>{comment.userEmail || "Аноним"}:</strong> {comment.text}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddComment} style={styles.commentForm}>
        <input
          type='text'
          placeholder='Напишите комментарий...'
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={styles.commentInput}
        />
        <button type='submit' style={styles.commentButton}>
          Отправить
        </button>
      </form>

      <Link to='/' style={styles.backButton}>
        ← Вернуться на главную
      </Link>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "24px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    background: "#fff",
  },
  owner: { marginTop: "10px", fontSize: "14px", color: "#555" },
  commentsList: { marginTop: "20px" },
  comment: {
    padding: "8px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  },
  commentForm: { display: "flex", marginTop: "10px", gap: "10px" },
  commentInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  commentButton: {
    padding: "10px 16px",
    backgroundColor: "#2196F3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  backButton: {
    display: "inline-block",
    marginTop: "20px",
    padding: "10px 16px",
    backgroundColor: "#2196F3",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
  },
};

export default TicketDetailsPage;
