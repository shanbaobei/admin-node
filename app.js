const express = require('express')   //把express引用进来
const router = require('./router')
const app = express()    //创建一个app，这个app就是一个express应用
const fs = require('fs')
const http = require('http')


app.use('/',router)
// app.get('/',function(req,res){
//     res.send('hellow world')
// })

const server = app.listen(18082,function(){    //将这个接口监听起来，并返回这个服务
    const { address,port} = server.address()
    console.log('http服务启动成功:http://%s:%s',address,port)
})
