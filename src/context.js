import axios from 'axios';
import React, { useState, useContext, useEffect } from 'react';

const table = {
  books: 10,
  geography: 22,
  mythology: 20,
  sports: 21,
  computers: 18,
  entertainment: 'manga',
};

const API_ENDPOINT = 'https://opentdb.com/api.php?';
const MANGA_API_ENDPOINT = 'https://0228-final-project.can.canonic.dev/api/';

const tempUrl =
  'https://opentdb.com/api.php?amount=10&category=10&difficulty=easy&type=multiple';
const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [waiting, setWaiting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [error, setError] = useState(false);
  const [quiz, setQuiz] = useState({
    amount: 10,
    category: 'books',
    difficulty: 'easy',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQuestions = async (url) => {
    setLoading(true);
    setWaiting(false);
    let response,
      manga = '';
    if (url.indexOf('manga') != -1) {
      manga = url.split('&');
      response = await axios(manga[0]).catch((err) => console.log(err));
    } else {
      manga = '';
      response = await axios(url).catch((err) => console.log(err));
    }
    if (response) {
      let data;
      if (manga != '') {
        data = response.data.data[0][manga[2]];
        data = data.slice(0, manga[1]);
      } else data = response.data.results;
      if (data.length > 0) {
        setQuestions(data);
        setLoading(false);
        setWaiting(false);
        setError(false);
      } else {
        setWaiting(true);
        setError(true);
      }
    } else {
      setWaiting(true);
    }
  };

  const nextQuestion = () => {
    setIndex((oldIndex) => {
      const index = oldIndex + 1;
      if (index > questions.length - 1) {
        openModal();
        return 0;
      } else {
        return index;
      }
    });
  };
  const checkAnswer = (value) => {
    if (value) {
      setCorrect((oldState) => oldState + 1);
    }
    nextQuestion();
  };

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setWaiting(true);
    setCorrect(0);
    setIsModalOpen(false);
  };
  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setQuiz({ ...quiz, [name]: value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const { amount, category, difficulty } = quiz;

    let url = `${API_ENDPOINT}amount=${amount}&difficulty=${difficulty}&category=${table[category]}&type=multiple`;
    if (category === 'entertainment')
      url = `${MANGA_API_ENDPOINT}${table[category]}&${amount}&${difficulty}`;
    fetchQuestions(url);
  };

  return (
    <AppContext.Provider
      value={{
        waiting,
        loading,
        questions,
        index,
        correct,
        error,
        isModalOpen,
        nextQuestion,
        checkAnswer,
        closeModal,
        quiz,
        handleChange,
        handleSubmit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
// make sure use
export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };
