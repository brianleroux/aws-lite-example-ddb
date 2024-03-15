import sandbox from '@architect/sandbox'
import awslite from '@aws-lite/client'
import test from 'node:test'
import assert from 'node:assert'

// factory function (a ctor basically)
const aws = await awslite({ 
  region: 'us-west-2',
  endpoint: 'http://localhost:5555', // not neccessary for live...
  plugins: [ import('@aws-lite/dynamodb') ] 
})

// check that the client exists and has methods
test('env', async t => {
  console.log(aws)
})

// start the local sandbox
test('start', async t => {
  await sandbox.start({ quiet: true })
})

// grab a reference to the dynamic generated tablename
// in cfn this would be super funky too!
let TableName

test('listTables', async t => {
  let res = await aws.dynamodb.ListTables()
  TableName = res.TableNames[0]
  assert.ok(res.TableNames)
  console.log(res)
})

test('PutItem', async t => {
  let res = await aws.dynamodb.PutItem({
    TableName,
    Item: { pk: 'hi', sk: 'hello', cat: 'sutro' }
  })
  assert.ok(res)
  console.log(res)
})

test('GetItem', async t => {
  let res = await aws.dynamodb.GetItem({
    TableName,
    Key: { pk: 'hi', sk: 'hello' }
  })
  assert.ok(res)
  console.log(res)
})

test('Query', async t => {
  let res = await aws.dynamodb.Query({
    TableName,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': 'hi'
    }
  })
  assert.ok(res.Count === 1)
})

test('DeleteItem', async t => {
  let res = await aws.dynamodb.DeleteItem({
    TableName,
    Key: { pk: 'hi', sk: 'hello' }
  })
  assert.ok(res)
  console.log(res)
})


test('Query', async t => {
  let res = await aws.dynamodb.Query({
    TableName,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': 'hi'
    }
  })
  assert.ok(res.Count === 0)
  console.log(res)
})

// end the local sandbox
test('start', async t => {
  await sandbox.end()
})
