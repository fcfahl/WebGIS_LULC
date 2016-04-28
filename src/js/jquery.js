// var map = window.localStorage.getItem('Atlas_06');
//
//
// var arr = JSON.parse( localStorage.getItem('Atlas_06') );
//
// console.log (arr);


$.getJSON('db.json', function(json) {
console.log("DB: ", json.WMS[0].Name);
});
