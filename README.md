# Appointment Scheduling System - Express Server Application

This is a simple appointment scheduling system implemented using Node.js and Express framework. It allows users to register, schedule appointments, leave reviews, access to the reviews fitered by the score number, and perform basic CRUD operations on user data, visit data, and review data.

## Setup
1. Clone this repository to your local machine. 
2. Make sure you have Node.js and npm installed.
3. Set up environment variables:
    - Create a `.env` file in the root directory.
    - Define the following variables:
        - `NODE_ENV`: Set it to `production` for production environment.
        - `SESSION_SECRET`: Secret key for session management.
4. Run the server using the command node app.js.
5. Access the application at http://localhost:3001.

## Features
### Web pages for clients
- http://localhost:3001
- http://localhost:3001/register
- http://localhost:3001/login
- http://localhost:3001/review
- http://localhost:3001/reviews/:id: Access to the review with its reviewID, using regular expression ```/^\/reviews\/(\d+)$/```
- http://localhost:3001/reviews/score=:id: Access to the reviews filtered by the score=1, score=2, score=3, score=4, or score=5, using regular expression ```/^\/reviews\/score=([1-5])$/``` 

### Registration
- Users can register with their name, email, and password at http://localhost:3001/register.
- Passwords are hashed using bcrypt before storing in the database.
- User data is stored in `./data/users.js`.

### Appointment Scheduling
- Users can schedule appointments by providing necessary details such as scheduled date, time, personal information, reason, etc., at http://localhost:3001.
- Scheduled appointments are stored in `./data/visits.js`.

### Review System
- Users can leave reviews along with a score at http://localhost:3001/review.
- Users can access to the review with its reviewID.
- Users can access to the reviews filtered by the score=1, score=2, score=3, score=4, or score=5.
- Review data is stored in `./data/reviews.js`.

### API Endpoints
- http://localhost:3001/api/users: Get all registered users.
- http://localhost:3001/api/visits: Get all scheduled visits. Optionally, filter visits by ```startDate``` and ```endDate```.  
For example, http://localhost:3001/api/visits?startDate=2024-03-01&endDate=2024-03-20 will return visits scheduled between March 1, 2024, and March 20, 2024.
- http://localhost:3001/api/visits/:id: Get visit details by ID.
- http://localhost:3001/api/reviews: Get all reviews.
- http://localhost:3001/api/reviews/:id: Delete a review by ID.
- http://localhost:3001/api/visits/:id: Delete a visit by ID.

## File Structure
- `server.js`: Main application file containing route handlers and server setup.
- `data/`: Directory containing ```.js``` files to store user, visit, and review data.
    - `users.js`
    - `visits.js`
    - `reviews.js`
- `public/`: Static assets including HTML, CSS, and client-side JavaScript files.
- `views/`: EJS templates for rendering web pages.
    - `index.ejs`
    - `register.ejs`
    - `review.ejs`
    - `login.ejs`
    - `styles.css`

## Dependencies

- `express`: Web framework for Node.js.
- `bcrypt`: Library for hashing passwords.
- `passport`: Authentication middleware for Node.js.
- `express-flash`: Middleware for displaying flash messages.
- `express-session`: Session middleware for Express.
- `method-override`: Middleware for supporting HTTP methods such as DELETE.
- `body-parser`: Middleware for parsing request bodies.

