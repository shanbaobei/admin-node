const mysql = require ('mysql')
const config = require('./config')
const debug = require('../utils/constant')
const { isObject } = require('../utils')
function connect() {
    return mysql.createConnection ({
        host:config.host,
        user:config.user,
        password:config.password,
        database:config.database,
        multipleStatements:true
    })
}

function querySql(sql) {
    const conn = connect()
    debug && console.log(sql)
    return new Promise((resolve, reject) => {
      try {
        conn.query(sql, (err, results) => {
          if (err) {
            debug && console.log('查询失败，原因:' + JSON.stringify(err))
            reject(err)
          } else {
            debug && console.log('查询成功', JSON.stringify(results))
            resolve(results)
          }
        })
      } catch (e) {
        reject(e)
      } finally {
        conn.end()
      }
    })
  }

function queryOne(sql) {
  return new Promise((resolve, reject) => {
    querySql(sql).then(results => {
      if (results && results.length > 0) {
        resolve(results[0])
      } else {
        resolve(null)
      }
    }).catch(err => {
      reject(err)
    })
  })
}
function insert(model,tableName){
  return new Promise((resolve,reject) => {  //返回Promise对象
  //if (!isObject(model)) {  //判断model是否是一个对象
    if (!isObject(model)) {
      reject (new Error('插入数据库失败，插入数据非对象'))
    } else {
      const keys = []
      const values = []
      var i=0;
      Object.keys(model).forEach(key => {
        if (model.hasOwnProperty(key)) {  //判断model上的key是自身的key还是原型链上的key
          keys.push(`\`${key}\``)
         
          values.push(`'${model[key]}'`)
          
          
        }
        
      })


      if (keys.length > 0 && values.length > 0) {
        let sql = `INSERT INTO \`${tableName}\` (`
        const keysString = keys.join(',')
        console.log("key是："+keysString)
        const valuesString = values.join(',')
        sql = `${sql}${keysString}) VALUES (${valuesString})`
        console.log(sql)
        // const keysString = keys.join(',')
        // const valuesString = values.join(',')
        // sql = `${sql}${keysString}) VALUES (${valuesString})`
        // debug && console.log(sql)
        const conn = connect()
        try {
          conn.query(sql, (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        } catch (e) {
          reject(e)
        } finally {
          conn.end()
        }
      } else {
        reject(new Error('SQL解析失败'))  
        } 
    }
  })
}
function update(model,tableName,where){
  return new Promise((resolve,reject) => {
    if (!isObject(model)) {
      reject(new Error('插入数据库失败，插入数据非对象'))
    }else {
      const entry = []
      Object.keys(model).forEach(key => {
        if (model.hasOwnProperty(key)) {
          entry.push(`\`${key}\`='${model[key]}'`)
        }
      })
      if (entry.length >0 ) {
        let sql = `UPDATE \`${tableName}\` SET`
        sql = `${sql} ${entry.join(',')} ${where}`
        const conn = connect()
        try {
          conn.query(sql, (err,result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        } catch (e) {
          reject(e)
        } finally {
          conn.end()
        }
      }
    }
  })
}
function and (where,k,v) {
    if (where === 'where') {
      return `${where} \`${k}\`='${v}'`
    } else {
      return `${where} and \`${k}\`='${v}'`
    }
}
function andLike (where,k,v) {
  if (where === 'where') {
    return `${where} \`${k}\` like '%${v}%'`
  } else {
    return `${where} and \`${k}\` like '%${v}%'`
  }
}
module.exports = {
    querySql,
    queryOne,
    insert,
    update,
    and,
    andLike

}