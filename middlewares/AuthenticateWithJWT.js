const jwt = require('jsonwebtoken');

// Middleware to extract user ID from JWT
// a function that takes in 3 arguments : req, rest, next
// next : is the next middleware in the chain or the route itself
// pattern: chain of responsibility
// calls the next middleware and pass the req
// making sure to call next() --> preemptively use next
// if no middleware in the chain it will be the route next()

function AuthenticateWithJWT(req, res, next) {
  
  // 1. get the JWT token from the headers
  const authHeader = req.headers.authorization;
  // 2. check if the JWT exist
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }
  // authheader, if it exists, should be "bearer <JWT>"
  // "bearer <JWT>.split('') => ['Bearer', '<JWT>'];
  const token = authHeader.split(' ')[1];
  // 3. extract out the token

  
  if(!token) {
    return res.status(401).json({
      'message': 'JWT not found'
    })
  }
  
  // 4. check if the token is valid
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret
    req.userId = decoded.userId; // Assuming the JWT payload contains `id`
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

module.exports = AuthenticateWithJWT