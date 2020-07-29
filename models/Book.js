const {
    MIME_TYPE_EPUB,
    UPLOAD_URL,
    UPLOAD_PATH
} = require('../utils/constant')
const fs = require('fs')
const Epub = require('../utils/epub')
const path = require('path')
const xml2js = require('xml2js').parseString

class Book {
    constructor(file, data) {
        if (file) {
            this.createBookFromFile(file)
        } else {
            this.createBookFromData(data)
        }
    }
    createBookFromFile(file) {
        // console.log('createBookFromFile', file)

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
        this.originalName = originalname // 电子书文件的原名
    }
    createBookFromData(data) {
        this.fileName = data.fileName
        this.cover = data.cover
        this.title = data.title
        this.author = data.author
        this.publisher = data.publisher
        this.bookId = data.fileName
        this.language = data.language
        this.rootFile = data.rootFile
        this.originalName = data.originalName
        this.path = data.path || data.filePath
        this.filePath = data.path || data.filePath
        this.unzipPath = data.unzipPath
        this.coverPath = data.coverPath
        this.createUser = data.username
        this.updateDt = new Date().getTime()
        this.updateDt = new Date().getTime()
        this.updatetype = data.updatetype === 0 ? data.updatetype : 1
        this.category = data.category || 99
        this.categoryText = data.categoryText || '自定义'

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
                    // console.log('epub end',epub)
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
                        this.rootFile =epub.rootFile
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
                            .then(({ chapters, chapterTree}) => {
                                this.contents = chapters
                                this.contentsTree = chapterTree
                                epub.getImage(cover,handleGetImage) //获取封面图片
                            })
                            .catch(err => reject(err)) // 解析目录
                                // console.log('cover',cover)
                                
                        } catch (e) {

                            reject(e)
                        }                        
                       
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
    parseContents(epub){   //电子书目录解析
        function getNcxFilePath() {  //获取ncx文件
            const spine = epub && epub.spine
            // console.log('spine',spine)
            const ncx = spine.toc && spine.toc.href
            const id = spine.toc && spine.toc.id
            if (ncx) {
                return ncx
            } else {
                return manifest[id].href
            }  
          
        }
        function findParent(array, level = 0,pid = '') {
            return array.map (item => {
                item.level = level
                item.pid = pid
                if (item.navPoint && item.navPoint.length > 0) {
                    item.navPoint = findParent(item.navPoint,level + 1,
                        item['$'].id)
                } else if (item.navPoint) {
                    item.navPoint.level = level + 1
                    item.navPoint.pid = item['$'].id               
                 }
                return item
            })
        }
        function flatten(array) {
            return [].concat(...array.map(item => {
                if (item.navPoint && item.navPoint.length >0) {
                    return [].concat(item, ...flatten(item.navPoint))
                } else if (item.navPoint) {
                    return [].concat(item, item.navPoint)
                }
                return item
            }))
        }
        const ncxFilePath = Book.genPath(`${this.
            unzipPath}/${getNcxFilePath()}`)
        if (fs.existsSync(ncxFilePath)){
            return new Promise ((resolve,reject) => {
                const xml = fs.readFileSync(ncxFilePath,'utf-8')
                const dir = path.dirname(ncxFilePath).replace(UPLOAD_PATH,'')
                console.log('dir',dir)
                const fileName = this.fileName
                xml2js(xml,{
                    explicitArray:false,
                    ignoreAttrs:false

                },function(err, json) {
                    if (!err) {
                      const navMap = json.ncx.navMap // 获取ncx的navMap属性
                      if (navMap.navPoint) { // 如果navMap属性存在navPoint属性，则说明目录存在
                        navMap.navPoint = findParent(navMap.navPoint)
                        const newNavMap = flatten(navMap.navPoint) // 将目录拆分为扁平结构
                        const chapters = []
                        
                        newNavMap.forEach((chapter, index) => { // 遍历epub解析出来的目录
                          
                          const src = chapter.content['$'].src                       
                          chapter.text = `${UPLOAD_URL}${dir}/${src}` // 生成章节的URL
                            chapter.label = chapter.navLabel.text || ''
                          chapter.navId = chapter['$'].id
                          chapter.fileName = fileName
                          chapter.order = index + 1
                          chapters.push(chapter)
                        })
                        const chapterTree = []
                        chapters.forEach(c => {
                          c.children = []
                          if (c.pid === '') {
                            chapterTree.push(c)
                          } else {
                            const parent = chapters.find(_ => _.navId === c.pid)
                            parent.children.push(c)
                          }
                        }) // 将目录转化为树状结构
                        console.log(chapterTree)
                        resolve({ chapters, chapterTree })
                      } else {
                        reject(new Error('目录解析失败，目录树为0'))
                      }
                    } else {
                      reject(err)
                    }
                  })
            })

        } else {
            throw new Error('文件目录不存在')
        }
        getNcxFilePath()

    }    
    static genPath(path) {
        if (!path.startsWith('/')) {
          path = `/${path}`
        }
        return `${UPLOAD_PATH}${path}`
      }
}

module.exports = Book
