import pkg  from 'jsonwebtoken';
const { verify } = pkg;


export const  authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded.profile;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err });
  }
};

export const authorizeRoles = (...allowedRoles)=>{
  return (req, res, next)=>{
   try {
      
      if (!req.user || !req.user.role) {
        return res.status(403).json({
          success: false,
          message: "User role not found or not authenticated.",
        });
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: [${allowedRoles.join(", ")}]`,
        });
      }

      // Role is authorized
      next();
    } catch (error) {
      console.error("Error in authorizeRoles middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Server error in role authorization.",
      });
    }}
}