const { querySql ,queryOne} = require('../db/index')

function login({ username, password }, next) {
  const sql = `select * from admin_user where username='${username}' and password='${password}'`
  return querySql(sql, next)
}
function findUser(username){
  return queryOne (`select id, username, role, avatar from admin_user where username='${username}'`)
}
// function findUser({ username }, next) {
//   const sql = `select * from admin_user where username='${username}'`
//   return queryOne(sql, next)
// }


module.exports = {
  login,
  findUser
}
