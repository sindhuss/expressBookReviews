const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return user.username === username && user.password === password;
      });
      return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
    }
  
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
  
      req.session.authorization = {
        accessToken, username
      };
      return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review; // Get the review text from the query parameter
    const username = req.session.username; // Get the username from the session

    // Basic validation
    if (!username) {
        return res.status(401).json({ message: "You must be logged in to post a review. Use GET /login/:username first." });
    }

    if (!reviewText) {
        return res.status(400).json({ message: "Review text is required in the query parameter, e.g., ?review=MyThoughtsHere" });
    }

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    // Logic to add or modify the review
    if (book.reviews[username]) {
        // If the user has already reviewed this book, modify the existing review
        book.reviews[username] = reviewText;
        return res.status(200).json({ 
            message: `Review by ${username} for ISBN ${isbn} has been modified successfully.`,
            reviews: book.reviews
        });
    } else {
        // If it's a new review from this user, add it to the reviews object
        book.reviews[username] = reviewText;
        return res.status(201).json({ 
            message: `New review by ${username} for ISBN ${isbn} has been added successfully.`,
            reviews: book.reviews
        });
    }
});

// Add a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const book = books[isbn];
    const isbn = req.params.isbn;
    const username = req.session.username; // Get the username from the session

    // Basic validation
    if (!username) {
        return res.status(401).json({ message: "You must be logged in to post a review. Use GET /login/:username first." });
    }

    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    // Logic to add or modify the review
    if (book.reviews[username]) {
        // If the user has already reviewed this book, modify the existing review
        book.reviews = book.reviews.filter((review) != book.reviews[username]));
        return res.status(200).json({ 
            message: `Review by ${username} for ISBN ${isbn} has been deleted successfully.`,
            reviews: book.reviews
        });
    } else {
        return res.status(201).json({ 
            message: `No review by ${username} for ISBN ${isbn} found.`,
            reviews: book.reviews
        });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
