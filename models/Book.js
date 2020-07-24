const {
    MIME_TYPE_EPUB,
    UPLOAD_URL,
    UPLOAD_PATH
} = require('../utils/constant')
const fs = require('fs')
const Epub = require('../utils/epub')

// const xml2js = require('xml2js').parseString

class Book {
    constructor(file, data) {
        if (file) {
            this.createBookFromFile(file)
        } else {
            this.createBookFromData(data)
        }
    }
    createBookFromFile(file) {
        console.log('createBookFromFile', file)

        const {
            destination,
            filename,
            mimetype = MIME_TYPE_EPUB,
            path,
            originalname
        } = file
        // 电子书的文件后缀名
        const suffix = mimetype === MIME_TYPE_EPUB ? '.epub' : ''
        // 电子书的原有路径
        const oldBookPath = path
        // 电子书的新路径
        const bookPath = `${destination}/${filename}${suffix}`
        // 电子书的下载URL
        const url = `${UPLOAD_URL}/book/${filename}${suffix}`
        // 电子书解压后的文件夹路径
        const unzipPath = `${UPLOAD_PATH}/unzip/${filename}`
        // 电子书解压后的文件夹URL
        const unzipUrl = `${UPLOAD_URL}/unzip/${filename}`
        if (!fs.existsSync(unzipPath)) {
            fs.mkdirSync(unzipPath, { recursive: true })
        }
        if (fs.existsSync(oldBookPath) && !fs.existsSync(bookPath)) {
            fs.renameSync(oldBookPath, bookPath)
        }
        this.fileName = filename // 文件名
        this.path = `/book/${filename}${suffix}` // epub文件相对路径
        this.filePath = this.path
        this.unzipPath = `/unzip/${filename}` // epub解压后相对路径
        this.url = url // epub文件下载链接
        this.title = '' // 书名
        this.author = '' // 作者
        this.publisher = '' // 出版社
        this.contents = [] // 目录
        this.cover = '' // 封面图片URL
        this.coverPath = '' // 封面图片路径
        this.category = -1 // 分类ID
        this.categoryText = '' // 分类名称
        this.language = '' // 语种
        this.unzipUrl = unzipUrl // 解压后文件夹链接
        this.originalname = originalname // 电子书文件的原名
    }
    createBookFromData(data) {

    }
    parse() {
        return new Promise((resolve,reject) => {
            const bookPath = `${UPLOAD_PATH}${this.filePath}`
            if(!fs.existsSync(bookPath)) {
                //失败
                reject(new Error('电子书不存在'))
            }
            const epub = new Epub(bookPath)
            epub.on('error', err => {
                reject(err)
              })
              epub.on("end",err=>{
                  if (err) {
                      reject(err)
                  }else {
                         //这里打印书记描述信息
                    // console.log(epub.metadata)
                    console.log('epub end',epub)
                    // 获取上传电子书的参数
                    const {
                        language,
                        creator,
                        creatorFileAs,
                        title,
                        cover,
                        publisher

                    } = epub.metadata
                    if (!title) {
                        reject(new Error('图书标题为空'))
                    } else {
                        this.title = title
                        this.language = language || 'en'
                        this.author = creator || creatorFileAs || 'unknown'
                        this.publisher = publisher || 'unkonwn'
                        this.footFile =epub.footFile
                        const handleGetImage = (err, file, mimeType) => {
                            // const handleGetImage =  (err, file, mimeType) => {
                                //  console.log (err,file,mimeType)
                                if (err) {
                                    reject(err)
                                } else {
                                    const suffix = mimeType.split('/')[1]
                                    const coverPath = `${UPLOAD_PATH}/img/${this.fileName}.${suffix}`
                                    const coverUrl = `${UPLOAD_URL}/img/${this.fileName}.${suffix}`
                                   fs.writeFileSync(coverPath,file,'binary')
                                    this.coverPath = `/img/${this.fileName}.${suffix}`
                                   this.cover = coverUrl
                                    resolve(this)
                                }
                                }
                        try  {
                            this.unzip ()
                            this.parseContents(epub)
                            
                                console.log('cover',cover)
                                epub.getImage(cover,handleGetImage)
                        } catch (e) {
                            reject(e)
                        }                        
                        epub.getImage(cover,handleGetImage)
                        // resolve(this)
                    }                   
                  }                          
            })
            //解析过程
                epub.parse()            
        })
    }
    unzip(){
        const AdmZip = require('adm-zip')
        const zip =new AdmZip(Book.genPath(this.path))
        zip.extractAllTo(Book.genPath(this.unzipPath), true)
    }
    parseContents(epub){
        function getNcxFilePath() {
            const spine = epub && epub.spine
            console.log('spine',spine)
        }

    }    
    static genPath(path) {
        if (!path.startsWith('/')) {
          path = `/${path}`
        }
        return `${UPLOAD_PATH}${path}`
      }
}

module.exports = Book
