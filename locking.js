/*
This is a very crude torture example in multi threading with the modified GraalJS. This example should not crash, BUT will
experience concurrency issues - the counter will almost never be correct and this is expected

*/

const threadCount = 16;
const Runnable = Java.type('java.lang.Runnable');
const Thread = Java.type('java.lang.Thread');
const ExtendableRunnable = Java.extend(Runnable);
const testObject = {};
const testArray = [];

const rwl = new (Java.type('java.util.concurrent.locks.ReentrantReadWriteLock'))(true);
const lock_r = rwl.readLock();
const lock_w = rwl.writeLock();

const _runnable = new ExtendableRunnable({
  run: function () {
    for (let i = 0; i < 1000; i++) {
      testObject[Math.random().toString()] = new Object();
      testArray.push(new Object());
    }
  }
});

const threads = [];

for (let i = 0; i < threadCount; i++) {
  threads.push(new Thread(_runnable));
}

const threadCounter = new Thread(new ExtendableRunnable({
  run: function () {
    while(1) {
      const activeThreads = threads.filter(t => t.isAlive());

      if (activeThreads.length === 0) {
        print(`All threads have completed.`);
        return;
      } else {
        print(`${activeThreads.length} threads are still active.`);
      }

      Thread.sleep(1000);
    }
  }
}));

threads.forEach(t => t.start());
threadCounter.start();
threads.forEach(t => t.join());

threadCounter.join();

print(`testObject has ${Object.keys(testObject).length} keys.`)
print(`testArray has ${testArray.length} values.`)
