const { env } = require('./env')
const UPLOAD_PATH = env ==='dev' ? '/Users/sam/upload/admin-upload-ebook' :
'/root/upload/admin-upload/ebook'
const debug = 'prod'
module.exports = {
    CODE_ERROR:-1,
    CODE_SUCCESS:0,
    CODE_TOKEN_EXPIRED:-2,
    PWD_SALT: 'admin_imooc_node',
    debug:true,
    PRIVATE_KEY: 'admin_imooc_node_test_youbaobao_xyz',
    JWT_EXPIRED: 60 * 60, // token失效时间
    UPLOAD_PATH
}