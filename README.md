# aliyun-oss-upload

- 用于前端直传阿里云
- 支持单文件和多文件夹上传
- 解决多句柄上传问题

# 用法示例

```js
upload(config:UploadOptions, cb: cb:(err:any,stats:any)=>void )
 interface UploadOptions {
  distPath: string // 目标路径
  basePath: string // 基础路径
  test:boolean // 是否是测试文件
  ignoreNames:string[] // 想要忽略的文件
  enableHttpCache: boolean // 是否开启http缓存
  httpCacheIgnoreNames: string[] // 开忽略http缓存文件
  PutObjectOptions: OSS.PutBucketOptions
}
```
