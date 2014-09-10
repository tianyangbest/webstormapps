/**
 * Created by tianyang1 on 2014/8/18.
 */
var photos = [];

photos.push({
    name: 'Think in Java',
    path: 'http://nodejs.org/images/logo.svg'
});

photos.push({
    name: 'Think in C#',
    path: 'http://nodejs.org/images/logo.svg'
});

var photos1 = [];
photos1.push({
    name: 'Think in Java',
    path: 'http://nodejs.org/images/logo.svg'
});

photos1.push({
    name: 'Think in C#',
    path: 'http://nodejs.org/images/logo.svg'
});
photos1.push({
    name: 'Think in JavaScript',
    path: 'http://nodejs.org/images/logo.svg'
});




exports.list = function (req, res) {
    res.set('photos1', {title: 'Photos', photos: photos1});
    res.render('photos', {title: 'Photos', photos: photos});
}