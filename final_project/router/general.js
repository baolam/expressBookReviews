const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper registration function
const registerUser = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "Customer already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register customer. Username and password are required." });
};

public_users.post("/register", registerUser);
public_users.post("/customer/register", registerUser);

// ==========================================
// Task 1 & Task 10: Get the book list available in the shop
// Using Promise callbacks / async-await
// ==========================================
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve) => {
        resolve(books);
      });
    };
    const bookList = await getBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

// ==========================================
// Task 2 & Task 11: Get book details based on ISBN
// Using Promise callbacks / async-await
// ==========================================
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });

  getBookByISBN
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

// ==========================================
// Task 3 & Task 12: Get book details based on author
// Using Promise callbacks / async-await
// ==========================================
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const getBooksByAuthor = new Promise((resolve, reject) => {
    let filteredBooks = [];
    const keys = Object.keys(books);
    keys.forEach((key) => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        filteredBooks.push({ isbn: key, ...books[key] });
      }
    });

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject({ status: 404, message: "No books found by this author" });
    }
  });

  getBooksByAuthor
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

// ==========================================
// Task 4 & Task 13: Get all books based on title
// Using Promise callbacks / async-await
// ==========================================
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = new Promise((resolve, reject) => {
    let filteredBooks = [];
    const keys = Object.keys(books);
    keys.forEach((key) => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        filteredBooks.push({ isbn: key, ...books[key] });
      }
    });

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject({ status: 404, message: "No books found with this title" });
    }
  });

  getBooksByTitle
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

// ==========================================
// Task 5 / Task 6: Get book review based on ISBN
// ==========================================
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

// =========================================================================
// TASKS 10 - 13: Additional Axios implementations with Promise / async-await
// =========================================================================

// Task 10: Get all books using Axios with async/await
const getBookListAxios = async () => {
  try {
    const response = await axios.get("http://localhost:5000/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Task 11: Get book details by ISBN using Axios with async/await
const getBookByISBNAxios = async (isbn) => {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Task 12: Get book details by Author using Axios with Promise callbacks
const getBookByAuthorAxios = (author) => {
  return axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`)
    .then(response => response.data)
    .catch(error => { throw error; });
};

// Task 13: Get book details by Title using Axios with async/await
const getBookByTitleAxios = async (title) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

module.exports.general = public_users;
module.exports.getBookListAxios = getBookListAxios;
module.exports.getBookByISBNAxios = getBookByISBNAxios;
module.exports.getBookByAuthorAxios = getBookByAuthorAxios;
module.exports.getBookByTitleAxios = getBookByTitleAxios;
