import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddTicketPage = ({ user }) => {
  const [concertName, setConcertName] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const isValid =
    concertName.trim() &&
    city.trim() &&
    date &&
    price &&
    Number(price) > 0 &&
    contact.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Сначала войдите в аккаунт!");
      return;
    }

    if (!isValid) {
      toast.error("Пожалуйста, заполните все поля!");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "tickets"), {
        concertName,
        city,
        date,
        price,
        contact,
        createdAt: serverTimestamp(),
        userEmail: user.email || null,
      });

      setConcertName("");
      setCity("");
      setDate("");
      setPrice("");
      setContact("");

      toast.success("✅ Билет успешно добавлен!", {
        position: "bottom-right",
        autoClose: 2000,
      });

      navigate("/mytickets");
    } catch (error) {
      console.error("Ошибка при добавлении билета:", error);
      toast.error("Ошибка при добавлении билета. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Добавить билет</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          ref={firstInputRef}
          type='text'
          placeholder='Название события'
          value={concertName}
          onChange={(e) => setConcertName(e.target.value)}
          onBlur={() => setTouched({ ...touched, concertName: true })}
          style={{
            ...styles.input,
            borderColor:
              touched.concertName && !concertName.trim() ? "red" : "#ccc",
          }}
        />
        <input
          type='text'
          placeholder='Город'
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onBlur={() => setTouched({ ...touched, city: true })}
          style={{
            ...styles.input,
            borderColor: touched.city && !city.trim() ? "red" : "#ccc",
          }}
        />
        <input
          type='date'
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onBlur={() => setTouched({ ...touched, date: true })}
          style={{
            ...styles.input,
            borderColor: touched.date && !date ? "red" : "#ccc",
          }}
        />
        <input
          type='number'
          placeholder='Цена (₼)'
          value={price}
          min='1'
          onChange={(e) => setPrice(e.target.value.slice(0, 7))}
          onBlur={() => setTouched({ ...touched, price: true })}
          style={{
            ...styles.input,
            borderColor:
              touched.price && (!price || Number(price) <= 0) ? "red" : "#ccc",
          }}
        />
        <input
          type='text'
          placeholder='Контакт (номер/почта)'
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          onBlur={() => setTouched({ ...touched, contact: true })}
          style={{
            ...styles.input,
            borderColor: touched.contact && !contact.trim() ? "red" : "#ccc",
          }}
        />
        <button
          type='submit'
          style={{
            ...styles.button,
            backgroundColor: isValid ? "#4CAF50" : "#9E9E9E",
            cursor: isValid ? "pointer" : "not-allowed",
          }}
          disabled={loading || !isValid}
        >
          {loading ? <span style={styles.spinner}></span> : "Добавить билет"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "500px",
    margin: "40px auto",
    padding: "24px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    transition: "border-color 0.2s",
  },
  button: {
    padding: "12px",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    transition: "background-color 0.3s, transform 0.2s",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "3px solid white",
    borderTop: "3px solid transparent",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },
};

export default AddTicketPage;
