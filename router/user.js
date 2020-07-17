const express = require('express')
const router = express.Router()
const Result = require('../models/Result')

router.post('/login', function(req, res) {
    console.log(req.body)
    const {username,password} = req.body
    if ( username === 'admin' && password === '11111'){
        new Result( '登录成功').success(res)
    }else{
        new Result( '登录失败 ').fail(res)
    }
    
})
router.get('/info',function(req,res,next){
    res.json('user info...')
})


module.exports = router