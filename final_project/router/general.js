const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/**
 * Handle new customer registration
 * Validates request payload and checks if username already exists
 */
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

// =========================================================================
// Asynchronous helper functions using async/await
// =========================================================================

/**
 * Task 10: Fetch all books available in the shop asynchronously
 * @returns {Promise<Object>} Object containing all books
 */
const getAllBooksAsync = async () => {
  // Simulates asynchronous retrieval of the book database
  return books;
};

/**
 * Task 11: Fetch book details based on ISBN asynchronously
 * @param {string} isbn - The ISBN of the book to retrieve
 * @returns {Promise<Object>} The book object if found, or null
 */
const getBookByISBNAsync = async (isbn) => {
  const book = books[isbn];
  if (book) {
    return book;
  }
  return null;
};

/**
 * Task 12: Fetch all books written by a specific author asynchronously
 * @param {string} author - The author name to search for
 * @returns {Promise<Array>} Array of books matching the specified author
 */
const getBooksByAuthorAsync = async (author) => {
  const matchingBooks = [];
  const keys = Object.keys(books);
  
  // Iterate through all book records and filter case-insensitively by author
  for (const key of keys) {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      matchingBooks.push({ isbn: key, ...books[key] });
    }
  }
  return matchingBooks;
};

/**
 * Task 13: Fetch all books matching a specific title asynchronously
 * @param {string} title - The book title to search for
 * @returns {Promise<Array>} Array of books matching the specified title
 */
const getBooksByTitleAsync = async (title) => {
  const matchingBooks = [];
  const keys = Object.keys(books);

  // Iterate through all book records and filter case-insensitively by title
  for (const key of keys) {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      matchingBooks.push({ isbn: key, ...books[key] });
    }
  }
  return matchingBooks;
};

// =========================================================================
// Express Route Handlers (Consistently using async/await)
// =========================================================================

/**
 * Task 1 & Task 10: Get the book list available in the shop
 * Uses async/await to retrieve all books
 */
public_users.get('/', async function (req, res) {
  try {
    const bookList = await getAllBooksAsync();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

/**
 * Task 2 & Task 11: Get book details based on ISBN
 * Uses async/await to retrieve book details by ISBN parameter
 */
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await getBookByISBNAsync(isbn);
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
  }
});

/**
 * Task 3 & Task 12: Get book details based on Author
 * Uses async/await to filter and retrieve books by author parameter
 */
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const matchingBooks = await getBooksByAuthorAsync(author);
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: `No books found by author '${author}'` });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

/**
 * Task 4 & Task 13: Get all books based on Title
 * Uses async/await to filter and retrieve books by title parameter
 */
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const matchingBooks = await getBooksByTitleAsync(title);
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: `No books found with title '${title}'` });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title", error: error.message });
  }
});

/**
 * Task 5 & Task 6: Get book review based on ISBN
 * Retrieves reviews for the given ISBN
 */
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await getBookByISBNAsync(isbn);
    if (book) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
});

// =========================================================================
// Standalone Axios Client Functions using async/await
// (Can be invoked to communicate with the REST API using Axios)
// =========================================================================

/**
 * Task 10 Axios Client: Retrieve all books via Axios HTTP GET
 */
const getBookListAxios = async () => {
  try {
    const response = await axios.get("http://localhost:5000/");
    return response.data;
  } catch (error) {
    console.error("Axios getBookList error:", error.message);
    throw error;
  }
};

/**
 * Task 11 Axios Client: Retrieve book by ISBN via Axios HTTP GET
 */
const getBookByISBNAxios = async (isbn) => {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return response.data;
  } catch (error) {
    console.error(`Axios getBookByISBN error for ISBN ${isbn}:`, error.message);
    throw error;
  }
};

/**
 * Task 12 Axios Client: Retrieve books by Author via Axios HTTP GET
 */
const getBookByAuthorAxios = async (author) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    console.error(`Axios getBookByAuthor error for author ${author}:`, error.message);
    throw error;
  }
};

/**
 * Task 13 Axios Client: Retrieve books by Title via Axios HTTP GET
 */
const getBookByTitleAxios = async (title) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    console.error(`Axios getBookByTitle error for title ${title}:`, error.message);
    throw error;
  }
};

module.exports.general = public_users;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBookByISBNAsync = getBookByISBNAsync;
module.exports.getBooksByAuthorAsync = getBooksByAuthorAsync;
module.exports.getBooksByTitleAsync = getBooksByTitleAsync;
module.exports.getBookListAxios = getBookListAxios;
module.exports.getBookByISBNAxios = getBookByISBNAxios;
module.exports.getBookByAuthorAxios = getBookByAuthorAxios;
module.exports.getBookByTitleAxios = getBookByTitleAxios;
