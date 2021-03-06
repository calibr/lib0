import * as promise from './promise.js'
import * as t from './testing.js'
import * as time from './time.js'
import * as error from './error.js'

/**
 * @param {Promise<any>} p
 * @param {number} min
 * @param {number} max
 */
const measureP = (p, min, max) => {
  const start = time.getUnixTime()
  return p.then(() => {
    const duration = time.getUnixTime() - start
    t.assert(duration <= max, 'Expected promise to take less time')
    t.assert(duration >= min, 'Expected promise to take more time')
  })
}

/**
 * @template T
 * @param {Promise<T>} p
 * @return {Promise<T>}
 */
const failsP = p => promise.create((resolve, reject) => p.then(() => reject(error.create('Promise should fail')), resolve))

/**
 * @param {t.TestCase} tc
 */
export const testRepeatPromise = async tc => {
  t.assert(promise.createEmpty(r => r()).constructor === Promise, 'p.create() creates a Promise')
  t.assert(promise.resolve().constructor === Promise, 'p.reject() creates a Promise')
  const rejectedP = promise.reject()
  t.assert(rejectedP.constructor === Promise, 'p.reject() creates a Promise')
  rejectedP.catch(() => {})
  await promise.createEmpty(r => r())
  await failsP(promise.reject())
  await promise.resolve()
  await measureP(promise.wait(10), 7, 1000)
  await measureP(failsP(promise.until(15, () => false)), 15, 1000)
  const startTime = time.getUnixTime()
  await measureP(promise.until(0, () => (time.getUnixTime() - startTime) > 100), 100, 1000)
  await promise.all([promise.wait(5), promise.wait(10)])
}
