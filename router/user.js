const express = require('express')
const router = express.Router()


router.post('/login',function(req,res,next) {
    console.log(req.body)
    res.json({
        code:0,
        msg:'登录成功'
    })
})
router.get('/info',function(req,res,next){
    res.json('user info...')
})


module.exports = router