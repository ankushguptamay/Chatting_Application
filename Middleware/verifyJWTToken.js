const jwt = require("jsonwebtoken");
const db = require("../Model");
const User = db.user;
const { USER_JWT_SECRET_KEY, ADMIN_JWT_SECRET_KEY } = process.env;

exports.verifyUserJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  // console.log('JWT Verif MW');
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  jwt.verify(token, USER_JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.user = decoded;
    next();
  });
};

exports.verifyAdminJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  // console.log('JWT Verif MW');
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  jwt.verify(token, ADMIN_JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.admin = decoded;
    next();
  });
};

exports.socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);

    const authHeader = req.headers.authorization || req.headers.Authorization;
    // console.log('JWT Verif MW');
    if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);

    const decodedData = jwt.verify(authHeader, process.env.USER_JWT_SECRET_KEY);

    const user = await User.findOne({ where: { id: decodedData.id } });

    if (!user)
      return next(new ErrorHandler("Please login to access this route", 401));

    socket.user = user;

    return next();
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Please login to access this route", 401));
  }
};
