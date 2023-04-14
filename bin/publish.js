const commander = require('commander')
const { publish } = require('./index')
const pkg = require('../package.json')

function pick(object, props = []) {
  return props.reduce((acc, key) => {
    let sourceKey
    let targetKey

    if (Array.isArray(key)) {
      [
        sourceKey,
        targetKey
      ] = key
    } else {
      sourceKey = key
      targetKey = key
    }

    if (hasOwnProperty.call(object, sourceKey)) {
      acc[targetKey] = object[sourceKey]
    }

    return acc
  }, {})
}

function list(val) {
  return val.split(',')
}

commander
  .version(pkg.version)
  .description('A cli interface of publish static resource to ali-oss.')
  .option('-t, --test <test>', 'auto set default bucktet, 0 with bucket:xxx, 1 with bucket:xxxx, default: 1', parseInt)
  .option('-p, --basePath <basePath>', 'the basePath of publish resource, default to /build/other')
  .option('-d, --distPath <distPath>', 'the entry of publish resource, default to ./dist')
  .option('-g, --ignoreNames <ignoreNames>', 'the resource names to ignore, if multi, separator use ,', list)
  .option('-c, --enableHttpCache <enableHttpCache>', 'set http header cache control, default 0', parseInt)
  .option('-cg, --httpCacheIgnoreNames <httpCacheIgnoreNames>', 'the resource names to ignore http cache, if multi, separator use ,', list)
  .parse(process.argv)

const options = pick(
  commander,
  ['config', 'id', 'secret', 'bucket', 'region', 'distPath', 'basePath', 'ignoreNames', 'enableHttpCache', 'httpCacheIgnoreNames']
)

publish(options)