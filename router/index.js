const express = require('express')
const boom = require('boom')
const bookRouter = require('./book')
const userRouter = require('./user')
const jwtAuth = require('./jwt')
const Result = require('../models/Result')



//注册路由
const router = express.Router()
//对后续请求进行身份验证
router.use(jwtAuth)


router.get('/', function (req, res) {
    res.send('欢迎学习小慕读书')
})
router.use('/user',userRouter)//对user下的所有请求都交给userRouter进行处理
router.user('/book',bookRouter)
// 集中处理404请求
router.use((req,res,next) => {
    next(boom.notFound('接口不存在'))
})
//错误向下传递
//自定义路由异常处理中间件

// router.use((err,req,res,next) => {
//     const msg = (err && err.message) || '系统处理错误'
//     const statusCode = (err.output && err.output.statusCode) || 500;
//     const errorMsg = (err.output && err.output.payload && err.output
//         .payload.error) || err.message
//         res.status(statusCode).json({
//             code:CODE_ERROR,
//             msg,
//             error:statusCode,
//             errorMsg
//         })
       
// })

router.use((err, req, res, next) => {
  console.log(err)
  if (err.name && err.name === 'UnauthorizedError') {
    const { status = 401, message } = err
    new Result(null, 'Token验证失败', {
      error: status,
      errMsg: message
    }).jwtError(res.status(status))
  } else {
    const msg = (err && err.message) || '系统错误'
    const statusCode = (err.output && err.output.statusCode) || 500;
    const errorMsg = (err.output && err.output.payload && err.output.payload.error) || err.message
    new Result(null, msg, {
      error: statusCode,
      errorMsg
    }).fail(res.status(statusCode))
  }
})



// 导出router 作用是处理路由的监听
module.exports = router
