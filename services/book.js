const Book  = require('../models/Book')
const db = require('../db')
const _ = require('lodash')  //通过该插件可以方便的提取contents中的冗余字段

function exists(book) {
    const {title,author,publisher} = book
    const sql = `select * from book where title = '${title}' and
    author = '${author}' and publisher = '${publisher}'`
    return db.queryOne(sql)
}
async function removeBook(book) {
    if(book) {
        book.reset()
        if (book.fileName) {  //为了避免在数据库中存在数据，也需要在数据库中删除
            const removeBookSql = `delete from book where fileName ='${book.fi}'`
            const removeContentsSql = `delete from contents where fileName ='
            ${book.fileName}'`
            await db.querySql(removeBookSql)
            await db.querySql(removeContentsSql)

        }
    }
}
async function insertContents(book){
    const contents = book.getContents()
    // console.log('contents是'  ,contents)
    if (contents && contents.length > 0){
        for (let i = 0;i < contents.length; i++) {
            const content = contents[i]
            const _content = _.pick(content,[
                'fileName',
                'id',
                'href',
                'order',
                'level',
                'label',
                'pid',
                'navId'
            ])
            console.log('_content是', _content)
            await db.insert(_content,'contents')
        }
    }
}


function insertBook(book) {
    return new Promise(async (resolve,reject) => {
        try {
            if (book instanceof Book) {  //判断当前的book参数是否是Book对象的一个实例
                const result = await exists(book)
                if (result) {
                    await removeBook(book)
                    reject(new Error('电子书已存在'))
                } else {
                    await db.insert(book.toDb(),'book') //插入电子书
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
function getBook(fileName) {
    return new Promise(async(resolve,reject) => {
        const bookSql = `select * from book where fileName='${fileName}'`
        const contentsSql = `select * from contents where fileName='${fileName}'
        order by \`order\``
        // const contentsSql = `select * from contents where fileName='${fileName}'`
        const book = await db.queryOne(bookSql)
        const contents = await db.querySql(contentsSql)
        if (book) {
            book.cover = Book.genCoverUrl(book)
            book.contentsTree = Book.genContentsTree(contents)
            
        }
        resolve(book)
    })
}
module.exports = {
    insertBook,
    getBook
}