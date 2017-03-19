# css-parse-keyframes
Node js moduel parse your css and  returns the object of all animations


## Usage:

```javascript
const kfParser = require('css-parse-keyframes');

kfParser.css('@keyframes anim-name{} .foo{baz:1}');
// or
kfParser.css(['@keyframes anim-name{} .foo{baz:1}']);
//result { 'anim-name': '@keyframes anim-name{}' }



//Synk
kfParser.files('./style.css');
// or
kfParser.files(['./style.css','style2.css']);

// Asynk
// files = Array|String
kfParser.files(files,(err,result)=>{
	if(err){
		return console.log(err);
	}
	console.log(result);
});

```
