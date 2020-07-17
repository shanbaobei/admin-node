const express = require('express')
const router = express.Router()
const Result = require('../models/Result')

router.post('/login', function(req, res) {
    console.log(req.body)
    new Result().success(res)
})
router.get('/info',function(req,res,next){
    res.json('user info...')
})


module.exports = router