const Book  = require('../models/Book')
const db = require('../db')

function exists(book) {}
function removeBook(book) {}
function insertContents(book){}


function insertBook(book) {
    return new Promise(async (resolve,reject) => {
        try {
            if (book instanceof Book) {
                const result = await exists(book)
                if (result) {
                    await removeBook(book)
                    reject(new Error('电子书已存在'))
                } else {
                    await db.insert(book,'book') //插入电子书
                    await insertContents(book)  //电子书目录的创建
                    resolve()
                }


            } else  {
                reject (new Error('添加的图书对象不合法'))
            }

        } catch (e) {
            reject(e)
        }
    })

}

module.exports = {
    insertBook
}