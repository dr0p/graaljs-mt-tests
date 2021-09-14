/*
This is a very crude torture example in multi threading with the modified GraalJS. This example should not crash, BUT will
experience concurrency issues - the counter will almost never be correct and this is expected

*/

const threadCount = 12;
let counter = 0;
const atomicCounter = new (Java.type('java.util.concurrent.atomic.AtomicInteger'))(0);
const Runnable = Java.type('java.lang.Runnable');
const ExtendableRunnable = Java.extend(Runnable);
const testMap = new Map();
const testObject = {};
const testArray = [];
const testJavaArray = new (Java.type('java.util.ArrayList'))();
const rwl = new (Java.type('java.util.concurrent.locks.ReentrantReadWriteLock'))(true);

const lock_r = rwl.readLock();
const lock_w = rwl.writeLock();

const testFunction = function() {
  let someValue = 0;
  var someOtherValue = 0;

  for (let i = 0; i < 100; i++) {
    someValue++;
    someOtherValue++;
  }

  if (someValue !== 100 || someOtherValue !== 100) {
    print(`someValue = ${someValue}`);
    print(`someOtherValue = ${someOtherValue}`)
    throw new Error('Stack access issue in closures');
  }
}


const _runnable = new ExtendableRunnable({
  run: function () {
    try {
      for (let i = 0; i < 100; i++) {
        const atomicCounterValue = atomicCounter.incrementAndGet()
        counter++;
        testMap.set(atomicCounterValue, new Object());
        
        try {
          lock_w.lock();
          testObject[atomicCounterValue.toString()] = new Object();
          testArray.push(atomicCounterValue);
        } finally {
          lock_w.unlock()
        }
        testJavaArray.add(atomicCounterValue);

        testFunction();
      }
    } catch (e) {
      throw e;
    }
  }
});

const threads = [];

for (let i = 0; i < threadCount; i++) {
  threads.push(new (Java.type('java.lang.Thread'))(_runnable));
}

threads.forEach(t => t.start());
threads.forEach(t => t.join());

print(`counter = ${counter}
should be ${threadCount * 100}`);

print(`atomicCounter = ${atomicCounter.get()}
should be ${threadCount * 100}`);

print(`testMap has ${testMap.size} entries.`)
print(`testObject has ${Object.keys(testObject).length} keys.`)
print(`testArray has ${testArray.length} values.`)
print(`testJavaArray has ${testJavaArray.size()} values.`)
