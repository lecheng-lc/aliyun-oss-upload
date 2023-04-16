import debuger from 'debug'
import OSS from 'ali-oss'
import { OSSOptions, UpTaskQueue } from './types'
import OSS_CONFIG from './config.js'
const debug = debuger('aliyun-oss-upload:main')
const stores: { [key: string]: OSS } = {}
const queue: UpTaskQueue[] = []
let taskCount = 0

function getStore(region: string, bucket: string) {
  const key: string = region + bucket
  if (!stores.hasOwnProperty(key)) {
    stores[key] = new OSS({
      accessKeyId: OSS_CONFIG.ACCESS_KEY_ID,
      accessKeySecret: OSS_CONFIG.ACCESS_KEY_SECRET,
      bucket: bucket,
      region: region
    })
  }
  return stores[key]
}

async function checkDelayTask() {
  if (taskCount < OSS_CONFIG.MAX_RUNING_COUNT) {
    const task = queue.shift()
    if (task) {
      taskCount++
      try {
        debug('upload %j => %j', task.filePath, task.objPath)
        const response = await task.store.put(task.objPath, task.filePath, task.uploadOptions)
        debug('response:')
        debug(response)
        taskCount--
        task.callback(null, response)
      } catch (err) {
        debug('upload failed with error:')
        debug(err)
        task.callback(err, null)
      }
    } else {
      debug('no task, end...')
    }
  } else {
    debug('too many task, wait...')
  }
}

function _upload(filePath: string, region: string, bucket: string, objPath: string, uploadOptions: OSSOptions, callback: Function) {
  if (!region) {
    region = OSS_CONFIG.DEFAULT_REGION
  }
  const store = getStore(region, bucket)
  queue.push({
    filePath,
    store,
    bucket,
    objPath,
    uploadOptions,
    callback: function (err, response) {
      callback(err, response)
      setTimeout(function () {
        checkDelayTask()
      }, 10)
    }
  })
  checkDelayTask()
}

function upload(filePath: string, region: string, bucket: string, objPath: string, uploadOptions: OSSOptions, callback: (err: any, response?: any) => void, retry = 3) {
  _upload(filePath, region, bucket, objPath, uploadOptions, function (err: any, response?: null) {
    retry--
    if (!err || retry <= 0) {
      callback(err, response)
    } else {
      setTimeout(() => {
        upload(filePath, region, bucket, objPath, uploadOptions, callback, retry)
      }, 10)
    }
  })
}

export default upload
