// var map = window.localStorage.getItem('Atlas_06');
//
//
// var arr = JSON.parse( localStorage.getItem('Atlas_06') );
//
// console.log (arr);


$.getJSON('db.json', function(json) {

  var DB = json.Layers;
  console.log("DB: ", DB);

  for (var i = 0; i < DB.length; i++) {
    console.log(DB[i].ID);
  }
});
