import OSS from 'ali-oss'
export interface GetAllFilesCallBack {
  (err: NodeJS.ErrnoException | null, stats?: {
    filePaths: string[],
    errors: (NodeJS.ErrnoException | null)[]
  }): void
}
export interface PublishOss{
  filePath: string
  objPath:string
  enableHttpCache:boolean
  test:boolean // 是否是测试文件
}
export interface UploadOptions {
  distPath: string // 目标路径
  basePath: string // 基础路径
  test:boolean // 是否是测试文件
  ignoreNames:string[] // 想要忽略的文件
  enableHttpCache: boolean // 是否开启http缓存
  httpCacheIgnoreNames: string[] // 开忽略http缓存文件
  PutObjectOptions: OSS.PutBucketOptions
}

export type VoidFn = () => void
export interface OSSOptions  extends OSS.PutBucketOptions
{
   headers?: {
    [key: string] : string
  }
}
export interface  UpTaskQueue {
  filePath: string // 文件路径
  store: OSS
  bucket: string
  objPath: string
  uploadOptions: OSSOptions
  callback: (err: any,response: any)=> void
}