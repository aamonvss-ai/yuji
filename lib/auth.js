import jwt from "jsonwebtoken";

/**
 * Extracts and decodes the JWT user payload from request authorization header.
 * @param {Request} req
 * @returns {object|null} Decoded user token payload or null
 */
export function getAuthUser(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return null;
  }

  const token = auth.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Enforces that the request is made by an OWNER only.
 * Throws 401 if missing/invalid token, or 403 if userType is not "owner".
 * @param {Request} req
 * @returns {object} Decoded user payload
 */
export function requireOwner(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw { status: 401, message: "Unauthorized: Missing or invalid token format" };
  }

  const token = auth.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw { status: 401, message: "Unauthorized: Invalid or expired token" };
  }

  if (decoded.userType !== "owner") {
    throw { status: 403, message: "Forbidden: Owner access required" };
  }

  return decoded;
}

// Alias for easy drop-in replacement where verifyOwner is already used
export const verifyOwner = requireOwner;
