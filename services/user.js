const { querySql } = require('../db/index')

function login({ username, password }, next) {
  const sql = `select * from admin_user where username='${username}' and password='${password}'`
  return querySql(sql, next)
}

function findUser({ username }, next) {
  const sql = `select * from admin_user where username='${username}'`
  return querySql(sql, next)
}


module.exports = {
  login,
  findUser
}
