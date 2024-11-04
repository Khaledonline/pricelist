function Copilot(pass){
 var url;
  var o1 = document.getElementsByClassName("object-attributes")[0];

  for (var i = 1; i < o1.rows.length; i++) {
    if (o1.rows[i].cells[0].innerText === "Category") {
      var dd = o1.rows[i].cells[1].innerText;
      const locationArray = dd.split(" › ");

      if (locationArray[0] === "Vehicles") {
        url = `https://raw.githubusercontent.com/${pass}/pricelist/refs/heads/main/Cars`;
      } else if (locationArray[0] === "Properties") {
        url = `https://raw.githubusercontent.com/${pass}/pricelist/refs/heads/main/Properties`;
      } else if (locationArray[0] === "Residential" || locationArray[0] === "Commercial") {
        url = `https://raw.githubusercontent.com/${pass}/pricelist/refs/heads/main/Properties`;
      }
    }
  }

  // Add the rest of your code logic here, following the original structure
  // for collecting, filtering, and displaying data.
  
  // Example:
  var oo = document.getElementsByClassName("object-attributes")[0];
  var ary = [];
  var ary2 = [];

  for (var i = 0; i < oo.rows.length; i++) {  
    if (oo.rows[i].cells[0].innerText === 'Location' || oo.rows[i].cells[0].innerText === 'Category' || oo.rows[i].cells[0].innerText === 'Price') {  
        var dd = oo.rows[i].cells[1].innerText;  
        const locationArray = dd.split(' › ');  
        
        ary.push(locationArray);  
    }  
}  

var o2 = document.getElementsByClassName('object-attributes')[1];  

for (var i = 0; i < o2.rows.length; i++) {  
    if (o2.rows[i].cells[0].innerText === 'Type'|| o2.rows[i].cells[0].innerText === 'Purpose') {  
        var dd = o2.rows[i].cells[1].innerText;  
        const locationArray = dd.split(' › ');  
        
        ary.push(locationArray);  
    }  
}  

// استخراج المتغيرات  
var type_ads = ary[0][1]; 

var result

if(type_ads === 'Cars for Sale'){
	for (var i = 0; i < o2.rows.length; i++) {  
    if (o2.rows[i].cells[0].innerText === 'Make' || o2.rows[i].cells[0].innerText === 'Year' || o2.rows[i].cells[0].innerText === 'Model') {  
        var dd = o2.rows[i].cells[1].innerText;  
        ary2.push(dd);  
    }  
}  
	
	
	var brand = ary2[0]
	var year = ary2[1]
	var model = ary2[2]
	
	var data;  
fetch(url).then(response => {  
    if (!response.ok) {  
        //alert('missing data');  
    }  
    return response.json();  
})  
.then(content => {  
    data = content;  

    // محاولة العثور على النتائج التي تتطابق مع جميع المعايير  
    var result = data['Cars'].filter(function(line) {
        return line.brand === brand && line.year === year && line.model === model 
    });  

     if (result.length === 0) {  
        result = data['Cars'].filter(function(line) {  
           return line.brand === brand && line.year === year && line.model === 'Other' 
        });  
    }  

    // إذا كانت النتيجة لا تزال فارغة  
    if (result.length > 0) {  
        var PriceTest = Number(result[0].lower_bound_ci_99.replace(/,/g, ''));  


var ele

for (var i = 0; i < oo.rows.length; i++) {  
    if ( oo.rows[i].cells[0].innerText === 'Price') {  
    	
    	ele = oo.rows[i]
    //	ele.cells[1].innerText = price.toLocaleString() + ' >> ' + PriceTest.toLocaleString()
    	oo.rows[i].style.color = 'white'
    }  
}


var price = Number(ary[2][0].replace(/,/g, ''));  


if(Number(PriceTest) < Number(price)){
	
ele.style.backgroundColor = 'green'
	
}else{
	
	ele.style.backgroundColor = 'red'
}


        const newDiv = document.createElement('div');  
        newDiv.innerHTML = brand + ' > ' + model + ' > ' + year + ' = ' + PriceTest.toLocaleString();  
        newDiv.style.margin = '10px';  
        newDiv.style.padding = '10px';  
        newDiv.style.color = 'yellow';  
        newDiv.style.fontWeight = 'bolder';  

        const headerDiv = document.getElementById('header');  
        headerDiv.appendChild(newDiv);  
    } else {  
                const newDiv = document.createElement('div');  
        newDiv.innerHTML = 'No Data in sheet';  
        newDiv.style.margin = '10px';  
        newDiv.style.padding = '10px';  
        newDiv.style.color = 'yellow';  
        newDiv.style.fontWeight = 'bolder';  

        const headerDiv = document.getElementById('header');  
        headerDiv.appendChild(newDiv);  
    }  
})  
.catch(error => {  
    console.log(error);  
});
	
	
}else if(type_ads === 'Properties'){
var cat = ary[0][1];  
var geol2 = ary[1][1];  
var geol3 = ary[1][2];  
var geol4 = ary[1][3];  
var price = Number(ary[2][0].replace(/,/g, ''));  
var unit_type = ary[3][0];  

var data;  
fetch(url).then(response => {  
    if (!response.ok) {  
     //   alert('missing data');  
    }  
    return response.json();  
})  
.then(content => {  
    data = content;  

    // محاولة العثور على النتائج التي تتطابق مع جميع المعايير  
    var result = data['Property egypt '].filter(function(line) {  
        return line.cat === cat && line.geol2 === geol2 && line.geol3 === geol3 && line.geol4 === geol4 && line.unit_type === unit_type;  
    });  

    // إذا لم توجد نتائج تطابق جميع المعايير، حاول العثور على النتائج التي تحتوي على "Unknown"  
    if (result.length === 0) {  
        result = data['Property egypt '].filter(function(line) {  
            return line.cat === cat && line.geol2 === geol2 && line.geol3 === geol3 && line.unit_type === unit_type && line.geol4 === 'Unknown';  
        });  
    }  

    // إذا كانت النتيجة لا تزال فارغة  
    if (result.length > 0) {  
        var PriceTest = Number(result[0].lower_limit.replace(/,/g, ''));  

	ary[2][0].innerText = price.toLocaleString() + ' >> ' +  PriceTest.toLocaleString()

var ele

for (var i = 0; i < oo.rows.length; i++) {  
    if ( oo.rows[i].cells[0].innerText === 'Price') {  
    	
    	ele = oo.rows[i]
    //	ele.cells[1].innerText = price.toLocaleString() + ' >> ' + PriceTest.toLocaleString()
    	oo.rows[i].style.color = 'white'
    }  
}




if(Number(PriceTest) < Number(price)){
	
ele.style.backgroundColor = 'green'
	
}else{
	
	ele.style.backgroundColor = 'red'
}


        const newDiv = document.createElement('div');  
        newDiv.innerHTML = cat + ' > ' + geol2 + ' > ' + geol3 + ' > ' + geol4 + ' = ' + PriceTest.toLocaleString();  
        newDiv.style.margin = '10px';  
        newDiv.style.padding = '10px';  
        newDiv.style.color = 'yellow';  
        newDiv.style.fontWeight = 'bolder';  

        const headerDiv = document.getElementById('header');  
        headerDiv.appendChild(newDiv);  
    } else {  
        console.log('لا توجد نتائج ملائمة.');  
    }  
})  
.catch(error => {  
    console.log(error);  
});
 // bayut


}else if(ary[3][0] === 'for-sale' && (type_ads === 'Residential' || type_ads === 'Commercial')){
var cat = ary[0][1];  
var geol2 = ary[1][1];  
var geol3 = ary[1][2];  
var geol4 = ary[1][3];  
var price = Number(ary[2][0].replace(/,/g, ''));  
var unit_type = ary[0][1];  

var data;  
fetch(url).then(response => {  
    if (!response.ok) {  
     //   alert('missing data');  
    }  
    return response.json();  
})  
.then(content => {  
    data = content;  

if(unit_type === 'Offices'){
	unit_type = 'Office'
}

    // محاولة العثور على النتائج التي تتطابق مع جميع المعايير  
    var result = data['Property egypt '].filter(function(line) {  
        return line.cat.includes(cat) && line.geol2.includes(geol2) && line.geol3.includes(geol3) && line.geol4.includes(geol4) && line.unit_type.includes(unit_type);  
    });  

    // إذا لم توجد نتائج تطابق جميع المعايير، حاول العثور على النتائج التي تحتوي على "Unknown"  
    if (result.length === 0) {  
        result = data['Property egypt '].filter(function(line) {  
            return line.cat.includes(cat) && line.geol2.includes(geol2) && line.geol3.includes(geol3) && line.unit_type.includes(unit_type) && line.geol4 === 'Unknown';  
        });  
    }  

    // إذا كانت النتيجة لا تزال فارغة  
    if (result.length > 0) {  
        var PriceTest = Number(result[0].lower_limit.replace(/,/g, ''));  

	ary[2][0].innerText = price.toLocaleString() + ' >> ' +  PriceTest.toLocaleString()

var ele

for (var i = 0; i < oo.rows.length; i++) {  
    if ( oo.rows[i].cells[0].innerText === 'Price') {  
    	
    	ele = oo.rows[i]
    //	ele.cells[1].innerText = price.toLocaleString() + ' >> ' + PriceTest.toLocaleString()
    	oo.rows[i].style.color = 'white'
    }  
}




if(Number(PriceTest) < Number(price)){
	
ele.style.backgroundColor = 'green'
	
}else{
	
	ele.style.backgroundColor = 'red'
}


        const newDiv = document.createElement('div');  
        newDiv.innerHTML = cat + ' > ' + geol2 + ' > ' + geol3 + ' > ' + geol4 + ' = ' + PriceTest.toLocaleString();  
        newDiv.style.margin = '10px';  
        newDiv.style.padding = '10px';  
        newDiv.style.color = 'yellow';  
        newDiv.style.fontWeight = 'bolder';  

        const headerDiv = document.getElementById('header');  
        headerDiv.appendChild(newDiv);  
    } else {  
        console.log('لا توجد نتائج ملائمة.');  
    }  
})  
.catch(error => {  
    console.log(error);  
});
}
}
