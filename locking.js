/*
This example shows how to deadlock the GraalJS by having unsynchronized writes to object properties.

Run this example several times - at some point the example will get stuck at printing `{someNumber} threads are still active.`
and you will notice that the CPU usage of the example is at (100 * someNumber)%
*/

const threadCount = 12;
const Runnable = Java.type('java.lang.Runnable');
const Thread = Java.type('java.lang.Thread');
const ExtendableRunnable = Java.extend(Runnable);
const testObject = {};

const _runnable = new ExtendableRunnable({
  run: function () {
    for (let i = 0; i < 1000; i++) {
      testObject[Math.random().toString()] = new Object();
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
