const adminAuth = (req, res, next) => {
  const token = "xyzsdsdsd";
  const isAdminAuthorization = token === "xyz";
  if (!isAdminAuthorization) {
    return res.status(403).send("Access denied");
  } else {
    next();
  }
};

module.exports = adminAuth;
