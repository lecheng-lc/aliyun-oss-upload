import fs from 'fs'
import path from 'path'
import mime from 'mime'
import { GetAllFilesCallBack, OSSOptions, PublishOss, UploadOptions } from './types'
import ossUpload from './oss-util.js'
import OssConfig from './config.js'
function getAllFiles(dirPath: string, cb: GetAllFilesCallBack) {
  fs.readdir(dirPath, function (err, files) {
    if (err) {
      cb(err)
      return
    }
    let filePaths: string[] = []
    let errors: (NodeJS.ErrnoException | null)[] = []
    let dirPaths: string[] = []
    let count = 0
    let statCount = 0
    files.forEach(function (filename) {
      const filePath = path.resolve(dirPath, filename)
      count++
      fs.stat(filePath, function (err1, stats) {
        if (err1) {
          errors.push(err1)
        } else {
          const isFile = stats.isFile()
          const isDir = stats.isDirectory()
          if (isFile) {
            filePaths.push(filePath)
          }
          if (isDir) {
            dirPaths.push(filePath)
          }
        }
        statCount++
        if (statCount === count) {
          endStat()
        }
      })
    })
    if (!files.length) {
      endStat()
    }
    function endStat() {
      if (dirPaths.length > 0) {
        let childCount = 0
        let childStatCount = 0
        dirPaths.forEach(function (childDirPath) {
          childCount++
          getAllFiles(childDirPath, function (err:NodeJS.ErrnoException | null, stats) {
            childStatCount++
            if (err) {
              errors.push(err)
            } else {
              if(stats?.errors.length) {
               errors = errors.concat(stats.errors)
              }
              filePaths = filePaths.concat(stats!.filePaths)
            }
            if (childStatCount === childCount) {
              cb(null, {
                filePaths,
                errors
              })
            }
          })
        })
      } else {
        cb(null, {
          filePaths,
          errors
        })
      }
    }
  })
}

/**
 * @param filePath  文件路径
 * @param bucket  使用的bucket
 * @param ossPath 使用的上传的oss路径
 * @param uploadOptions  使用oss上传的参数
 * @param callback  回调方法
 */
function uploadFile(filePath:string, bucket:string, ossPath:string, uploadOptions: OSSOptions, callback:(status: boolean, err?:any)=>void) {
  ossUpload(filePath, '', bucket, ossPath, uploadOptions, function (err, res) {
    if (err) {
      console.warn(err)
      callback(false, err)
    } else {
      callback(true)
    }
  })
}

/**
 * 发布文件夹
 * @param {*} config UploadOptions
 * @param {*} cb 
 */
function publish(config: UploadOptions, cb:(err:any,stats:any)=>void) {
  let distPath = config.distPath ? config.distPath : './dist'
  const basePath = config.basePath ? config.basePath : '/build/other'
  const ignoreNames = config.ignoreNames ? config.ignoreNames : []
  const enableHttpCache = config.enableHttpCache || false
  const httpCacheIgnoreNames = config.httpCacheIgnoreNames || []
  const uploadOptions:OSSOptions = {
    acl: 'public-read-write',
    dataRedundancyType: 'LRS',
    timeout: 0,
    storageClass: 'Standard'
  }
  if (enableHttpCache) {
    uploadOptions.headers = {
      'cache-control': 'public,max-age=31536000,immutable' // 缓存1年，参考facebook的静态文件设置
    }
  }
  let bucket = OssConfig.BUCKET
  if (config && config.hasOwnProperty('test') && !config.test) {
    bucket = OssConfig.BUCKET
  }
  distPath = path.resolve(distPath)
  const divider = '----------------------------------------'
  if (fs.existsSync(distPath)) {
    console.info('start upload files to aliyun oss bucket:' + bucket + ' ...')
    console.info(divider)
    getAllFiles(distPath, function (err, stats) {
      if (!err) {
        const filePaths:string[] = stats!.filePaths
        let allCount = 0
        let successCount = 0
        let errorCount = 0
        const errorFilePaths:string[] = []
        filePaths.forEach(function (filePath) {
          const ossPath = filePath.replace(distPath, basePath).replace(/\\/g, '/')
          const filename = path.basename(filePath)
          if (ignoreNames.indexOf(filename) === -1) {
            allCount++
            const _uploadOptions = httpCacheIgnoreNames.indexOf(filename) >= 0 ? uploadOptions : Object.assign({
              mime: mime.getType(filePath)
            }, uploadOptions)
            uploadFile(filePath, bucket, ossPath, _uploadOptions, function (res) {
              if (!res) {
                errorFilePaths.push(filePath)
                errorCount++
              } else {
                successCount++
              }
              if (successCount + errorCount === allCount) {
                callback(null, {
                  successCount,
                  errorCount,
                  errorFilePaths
                })
              }
            })
          }
        })
      } else {
        callback(err)
      }
    })
  } else {
    const err = new Error(distPath + ' Not Found!')
    callback(err)
  }
  function callback(err:any, stats?:any) {
    if (err) {
      console.log('end upload with error:' + err)
    } else {
      console.log('😄 upload files to ali-oss bucket:' + bucket + ' success:' + stats.successCount + ' failed:' + stats.errorCount + '\n')
    }
    if (cb) {
      cb(err, stats)
    }
  }
}

/**
 * 上传单个文件
 * @param {*} config 
 * @param {*} cb 
 */
function upload(config: PublishOss, cb: (err:any, stats?: any) => void) {
  let filePath = config.filePath ? config.filePath : ''
  let objPath = config.objPath ? config.objPath : ''
  let bucket = OssConfig.BUCKET
  if (config && config.hasOwnProperty('test') && !config.test) {
    bucket = OssConfig.BUCKET
  }
  filePath = path.resolve(filePath)
  if (!filePath) {
    return cb(new Error('filePath is empty!'))
  }
  if (!objPath) {
    objPath = '/build/other/' + path.basename(filePath)
  }
  const enableHttpCache = config.enableHttpCache || false
  const uploadOptions:OSSOptions = {
    acl: 'public-read-write',
    dataRedundancyType: 'LRS',
    timeout: 0,
    storageClass: 'Standard'
  }
  if (enableHttpCache) {
    uploadOptions.headers = {
      'cache-control': 'public,max-age=31536000,immutable'
    }
  }
  const _uploadOptions = Object.assign({
    mime: mime.getType(filePath)
  }, uploadOptions)
  uploadFile(filePath, bucket, objPath, _uploadOptions, function (res, err) {
    if (cb) {
      cb(res, err)
    }
  })
}

export {
  publish,
  upload
}