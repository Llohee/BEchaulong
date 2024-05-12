const authorizationCheck = (req, res, next) => {
  const userRoles = req.user.role;
  console.log(req.user)
  console.log(userRoles);
  if (userRoles.includes("admin")) {
    next();
  } else {
    res.send("User không có quyền");
  }
};

module.exports = { authorizationCheck }