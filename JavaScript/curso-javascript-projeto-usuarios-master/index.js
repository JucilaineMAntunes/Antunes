var name =document.querySelector('#exampleInputName');
//nome.value = 'juci'
//nome.style.color ="blue"
var gender =document.querySelectorAll("#form-user-create [name=gender]:checked");

var birth =document.querySelector('#exampleInputBirth');
var country =document.querySelector('#exampleInputCountry');
var email =document.querySelector('exampleInputEmail');
var password =document.querySelector('#exampleInputPassword');
var file =document.querySelector('#exampleInputFile');
var gender =document.querySelector('#exampleInputFile');


var fields = document.querySelectorAll("#form-user-create [name]");

fields.forEach(function(field, index){
 console.log(field.name, field.value, field.id, field.checked)

});
