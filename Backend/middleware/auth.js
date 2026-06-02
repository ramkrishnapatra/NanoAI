import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
    try {
        // 1. Extract the token from cookies (set during login) or the Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // 2. If no token is found, deny access
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized request: No token provided" 
            });
        }

        // 3. Verify the token using your secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // 4. Attach the decoded user information to the request object
        // (Optional: You can also query the database here to attach the full user object if needed)
        req.user = decodedToken;

        // 5. Proceed to the next middleware or the actual route controller
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false,
            message: "Unauthorized request: Invalid or expired token" 
        });
    }
};