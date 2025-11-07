const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Function to check if the user exists
const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
      return user.username === username;
    });
    return userswithsamename.length > 0;
  };

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  const foundBooks = [];

    // Iterate over the values of the books object
    // Object.values() returns an array of the nested book objects
    Object.values(books).forEach(book => {
        // Check if the current book's author matches the search name (case-insensitive)
        if (book.author.toLowerCase() === author) {
            foundBooks.push(book);
        }
    });

    res.send(foundBooks);  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    const foundBooks = [];

    // Iterate over the values of the books object
    // Object.values() returns an array of the nested book objects
    Object.values(books).forEach(book => {
        // Check if the current book's title matches the search name (case-insensitive)
        if (book.title.toLowerCase() === title) {
            foundBooks.push(book);
        }
    });

    res.send(foundBooks); 
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    // 1. Obtain the ISBN (which is the object key/ID) from the URL parameters
    const requestedIsbn = req.params.isbn; 

    // 2. Look up the book directly using the ISBN key
    const book = books[requestedIsbn];

    if (book) {
        // Check if the book has reviews
        if (Object.keys(book.reviews).length > 0) {
            // Return the reviews associated with that specific book ID
            res.status(200).json({
                title: book.title,
                reviews: book.reviews
            });
        } else {
            // No reviews found for that specific book
            res.status(404).json({ 
                message: `Book found (ISBN ${requestedIsbn}), but it has no reviews.` 
            });
        }
    } else {
        // Book with the given ISBN/ID does not exist
        res.status(404).json({ 
            message: `Book with ISBN ${requestedIsbn} not found.` 
        });
    }
});

module.exports.general = public_users;
