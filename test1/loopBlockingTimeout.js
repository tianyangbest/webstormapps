

function test1(fn) {
    setTimeout(function () {
        console.log('Test1');
    }, 1000000);
    fn;
}

function test2() {
    console.log('test2');
}

var start = new Date;
test1(test2());
while (new Date - start < 1000) {};