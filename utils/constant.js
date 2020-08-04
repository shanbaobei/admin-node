const { env } = require('./env')
const UPLOAD_PATH = env ==='dev' ? 'D:/develop/file/admin-node' :
'/root/upload/admin-upload/ebook';
const UPLOAD_URL = env ==='dev' ? 'http://book.youbaobao.xyz:8089/admin-node' :
'http:www//book.youbaobao.xyz:8089/admin-node'
const OLD_UPLOAD_URL = env === 'dev' ?
  'http://test.youbaobao.xyz:8089/book/res/img' :
  'https://book.youbaobao.xyz/book/res/img'


const debug = 'prod'
module.exports = {
    CODE_ERROR:-1,
    CODE_SUCCESS:0,
    CODE_TOKEN_EXPIRED:-2,
    PWD_SALT: 'admin_imooc_node',
    debug:true,
    PRIVATE_KEY: 'admin_imooc_node_test_youbaobao_xyz',
    JWT_EXPIRED: 60 * 60, // token失效时间
    UPLOAD_PATH,
    MIME_TYPE_EPUB:'application/epub+zip',
    UPLOAD_URL,
    OLD_UPLOAD_URL
}