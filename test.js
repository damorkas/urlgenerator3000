var arr = ['300x300', '300x300_v1', '300x300_v12', '300x300_v2', '300x250', '300x250_v1', '300x100', '300x300_spec', '300x300_0', '300x300_z', '300x300_vvv', '300x300_va'];

var copyArr = arr.slice(0);

var reg, matched;

var trueList = [];

// remove all with rule {skaicius}x{skaicius}_{ne 'v' + skaicius}
copyArr.reduce(function (list, provider, index) {
    if (provider.match(new RegExp(/\d+x\d+_(?!v\d+)/, 'g'))) {
        list.push(index);
    }

    return list;
}, []).reverse().forEach(function (index) {
    copyArr.splice(index, 1);
});

copyArr

copyArr.forEach(function (v, i) {
    reg = new RegExp(`${v}_.*`, 'g');
    matched = copyArr.filter(x => x.match(reg));

    if (matched.length > 0) {
        copyArr.splice( copyArr.indexOf(v), 1 );
        matched = matched.sort(function (a, b) {
            return a.substr(a.indexOf('_') + 2) - b.substr(b.indexOf('_') + 2);
        }).reverse();
        matched.splice( matched.indexOf(matched[0]), 1 );
        matched.forEach((v, i) => copyArr.splice(copyArr.indexOf(v), 1 ));
    }

    matched
});

copyArr
