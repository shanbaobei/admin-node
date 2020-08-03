const Book  = require('../models/Book')
const db = require('../db')
const _ = require('lodash')  //通过该插件可以方便的提取contents中的冗余字段

function exists(book) {
    return false
}
function removeBook(book) {}
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

module.exports = {
    insertBook
}