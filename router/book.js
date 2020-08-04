const express = require('express')
const multer = require('multer')   //express的中间件，来开发文件上传功能
const { UPLOAD_PATH } = require('../utils/constant')
const Result = require('../models/Result')
const Book = require('../models/Book')
const boom = require('boom')
const { decoded } = require('../utils')
const bookService = require('../services/book')

const router = express.Router()

router.post(
    '/upload',
    multer({ dest: `${UPLOAD_PATH}/book` }).single('file'),
    function (req, res, next) {
        if (!req.file || req.file.length == 0) {
            new Reclssult('上传电子书失败').fail(res)
        } else {
            
            const book = new Book(req.file)
            
            book.parse()
            .then(book => {
                console.log('book',book)
                new Result(book,'上传电子书成功').success(res)
            })
            .catch(err => {
                next(boom.badImplementation(err))
            })           
            
        }

    })
router.post(
    '/create',
    function(req,res,next) {
        const decode = decoded(req)
        if (decode && decode.username) {
            req.body.username = decode.username
        }
        const book = new Book(null,req.body)
        
    // const book = {}
        // console.log(book)
        bookService.insertBook(book)  //使用insertBook将 book传入
        .then(() => {
            new Result ('电子书添加成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
    }
)
router.post(
    '/update',
    function(req,res,next) {
        const decode = decoded(req)
        
        if (decode && decode.username) {
            req.body.username = decode.username
        }
        const book = new Book(null,req.body)
        
    // const book = {}
        // console.log(book)
        bookService.updateBook(book)  //使用updateBook将 book传入
        .then(() => {
            new Result ('更新电子书添加成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
    }
)
router.get('/get',function(req,res,next) {
    const { fileName } = req.query
    if (!fileName) {
        next(boom.badRequest(new Error('参数fileName不能为空')))
    } else {
        bookService.getBook(fileName).then(book => {
            new Result(book,'获取图书信息成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
    }
})



module.exports = router