const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleParam = req.params.title.toLowerCase();
    // 1. Define a function that returns a Promise
    const findBooksByTitle = (searchTitle) => {
        return new Promise((resolve, reject) => {
            const foundBooks = [];
            const bookValues = Object.values(books);
            // Simulate an asynchronous operation (optional: a slight delay)
            // Or just resolve immediately after the synchronous search
            setTimeout(() => {
                bookValues.forEach(book => {
                    // **Assuming 'books' is a defined object accessible here**
                    if (book.title && book.title.toLowerCase() === searchTitle) {
                        foundBooks.push(book);
                    }
                });

                if (foundBooks.length > 0) {
                    // Resolve the promise with the found books
                    resolve(foundBooks);
                } else {                                       
                    // If you wanted to reject:
                    reject(new Error("No books found with that title."));
                }
            }, 10); // A minimal delay for illustration, can be 0 or removed entirely.
        });
    };

    // 2. Call the promise-returning function and handle the result
    findBooksByTitle(titleParam)
        .then(foundBooks => {
            // Success: Send the list of found books (may be empty)
            res.send(foundBooks);
        })
        .catch(error => {
            // Handle any rejection (error) from the promise
            console.error("Error searching for books:", error.message);
            // Send an internal server error response
            res.status(500).send("An error occurred while searching for books.");
        });
});

const getBooksByAuthor = (authorName) => {
    return new Promise((resolve, reject) => {
        const searchAuthor = authorName.toLowerCase();
        const foundBooks = [];        
        // Assume 'books' is globally or contextually available
        if (!books) {
            // Optional: reject if books object is not available
            return reject(new Error("Book data not available.")); 
        }
        // Synchronous iteration is wrapped in a Promise
        Object.values(books).forEach(book => {
            if (book.author.toLowerCase() === searchAuthor) {
                foundBooks.push(book);
            }
        });
        // Resolve the promise with the result
        resolve(foundBooks);
    });
};

public_users.get('/author/:author',async function (req, res) {
    const author = req.params.author;

    try {
        // Await the resolution of the promise
        const foundBooks = await getBooksByAuthor(author);

        if (foundBooks.length > 0) {
            // Send the array of found books
            return res.status(200).send(foundBooks);
        } else {
            // Send a 404 if no books are found
            return res.status(404).json({ message: `No books found for author: ${author}` });
        }
    } catch (error) {
        // Handle any potential rejection/error from the promise
        console.error("Error fetching books by author:", error);
        return res.status(500).json({ message: "An error occurred while fetching book details." });
    } 
  });



// Get the book list available in the shop
public_users.get('/',function (req, res) {
    // Call the function that returns a Promise
    getAllBooks()
    .then(booksData => {
        // If the promise resolves successfully (booksData is the result)
        res.status(200).send(JSON.stringify(booksData, null, 4));
    })
    .catch(error => {
        // If the promise rejects (an error occurs)
        console.error(error.message);
        res.status(500).send({ message: "Error retrieving book list." });
    });
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    const isbn = req.params.isbn;

    // Simulate an async data fetch using a Promise
    // In a real app, this would be a DB call (e.g., const book = await DB.getBook(isbn);)
    const getBookByISBN = (id) => {
        return new Promise((resolve) => {
            // Simulate a slight delay or just resolve immediately
            // setTimeout(() => {
                resolve(books[id]);
            // }, 10);
        });
    };

    try {
        // Use await to wait for the Promise to resolve
        const book = await getBookByISBN(isbn);

        if (book) {
            res.send(book);
        } else {
            res.status(404).send({ message: `Book with ISBN ${isbn} not found.` });
        }
    } catch (error) {
        // Handle any errors that might occur during the async operation
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
 });
  
function getAllBooks() {
    return new Promise((resolve, reject) => {
    if (books) {
        resolve(books); // Resolve the promise with the books data
    } else {
        // In a real scenario, this would be an error from the database
        reject(new Error("No books found")); 
    }
    });
}

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
