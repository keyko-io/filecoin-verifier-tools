var fs = require('fs')
var path = require('path')
const { test_new_template } = require('../new_template')

it('we can parse new template correctly', () => {
  const issueContent = fs.readFileSync(
    path.resolve(__dirname, '../samples/utils/new_ldn_template_yaml.md'),
    { encoding: 'utf8' },
  )

  const parsedResult = test_new_template(issueContent)

  expect(parsedResult.name).toBe('hello')
  expect(parsedResult.website).toBe('www.test.com')
  expect(parsedResult.country).toBe('Algeria')
  expect(parsedResult.total).toBe('3TiB')
  expect(parsedResult.weekly).toBe('5TiB')
  expect(parsedResult.address).toBe('f12312')
},
)
