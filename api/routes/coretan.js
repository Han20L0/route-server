//fungsi pencarian koordinat terdekat
function cariKoordinatTerdekat(koordinatInputan, daftarKoordinat) {
    // Parsing koordinat inputan menjadi latitude dan longitude
    const [lat1, lng1] = koordinatInputan.split(",");
  
    // Inisialisasi variabel jarak minimum dan koordinat terdekat
    let jarakMin = Infinity;
    let koordinatTerdekat = null;
  
    // Looping untuk mencari koordinat terdekat
    daftarKoordinat.forEach((koordinat) => {
      // Parsing koordinat dari daftar menjadi latitude dan longitude
      const [lat2, lng2] = koordinat.split(",");
  
      // Menghitung jarak antara dua koordinat dengan rumus haversine
      const R = 6371; // radius bumi dalam km
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const jarak = R * c;
  
      // Memperbarui koordinat terdekat dan jarak minimum jika ditemukan jarak yang lebih kecil
      if (jarak < jarakMin) {
        jarakMin = jarak;
        koordinatTerdekat = koordinat;
      }
    });
  
    return koordinatTerdekat;
  }
  
  // Fungsi untuk mengkonversi derajat ke radian
  function toRad(degrees) {
    return (degrees * Math.PI) / 180;
  }
  
// Fungsi Validasi 
function validate_coordinates (res, coordinates){
    //proses fungsi validasi coordinate
    
    if (coordinates === undefined){
        res.status(400).json({
            message : "Coordinates is undefined",

        });
    }
 
}

function cekKoordinat(koordinat) {
    const regex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    return regex.test(koordinat);
}
  
function validate_vehicle (res, vehicle){
    //console.log(vehicle, typeof  vehicle);
    //proses fungsi validasi vehicle
    
    if (vehicle === undefined){
        res.status(400).json({
            message : "vehicle is undefined",

        });
    }

    vehicle = parseInt(vehicle)
    //console.log(vehicle);
    //proses vehicle bukan 1 atau 0 maupun huruf
    if ((vehicle === 0) || (vehicle === 1) ){
     
    }else{
        res.status(400).json({
            message : "Vehicle Error",

        });
    }

}

function validate_priorities (res, priorities){
    //proses fungsi validasi priorities
    if (priorities === undefined){
        res.status(400).json({
            message : "priorities is undefined",

        });
    }
}

function cekDuplikat(priorities) {
    let obj = {};
    for (let i = 0; i < priorities.length; i++) {
      if (obj[priorities[i]]) {
        return true;
      } else {
        obj[priorities[i]] = true;
      }
    }
    return false;
  }

function validate_linestring (res, linestring){
    //proses fungsi validasi linestring
    if (linestring === undefined){
        res.status(400).json({
            message:"Linestring is undefined",
        });
    }

    linestring = parseInt(linestring)
    //proses linestring bukan 1 atau 0 maupun huruf
    if ((linestring === 0) || (linestring === 1)){

    }else{
        res.status(400).json({
            message:"Linestring is Error",
        });
    }

}
 //validate coordinates
 validate_coordinates(res, coordinates);

 //split coordinates
 const coordinates_splited = split_coordinates(coordinates);

 //chek validasi titik coordinates
 const coordinate_Source_valid = cekKoordinat(coordinates_splited[0]);
 const coordinate_target_valid = cekKoordinat(coordinates_splited[1]);
 console.log(coordinate_Source_valid);
 console.log(coordinate_target_valid);
 
 //validasi vehicle
 validate_vehicle(res, vehicle);
 //pembuat vehicle menjadi int 
 const vehicle_type = parseInt(vehicle);

 //validasi linestring
 validate_linestring(res, linestring);
 //pembuat line string menjadi int
 const linestring_type = parseInt(linestring);

 //validasi priorities
 validate_priorities(res, priorities);

 //split priorities
 const priorities_type = split_priorities(priorities);
 console.log(priorities_type);

 //chek duplikasi priority
 const priorities_duplicated_check = cekDuplikat(priorities_type);
 console.log(priorities_duplicated_check);

 //ini dibikin jadi function buat angka duplicated
// const arry = priorities_type;

// const toFindDuplicates = arry => arry.filter((item, index) => arry.indexOf(item) !== index)
 //const duplicateElementa = toFindDuplicates(arry);
// console.log(duplicateElementa);

// Fungsi Split
function split_coordinates (coordinates){
    const coordinate_array = coordinates.split(";");
    //console.log(coordinate_array);
    const coordinates_source = coordinate_array[0].split(",");
    //console.log(coordinates_source);
    const coordinates_target = coordinate_array[1].split(",");
    //console.log(coordinates_target);
    //proses coordinate titik awal tidak valid
    return [coordinates_source, coordinates_target]

}

function split_priorities (priorities){
    const priorities_array = priorities.split("");
    //console.log(priorities_array);
    return [priorities_array]
}


//ini fungsi klo make manual buat coordinates
if (coordinates_splited[0][0] >= -90 && coordinates_splited[0][0] <= 90){

}else{
    res.status(400).json({
        message : "Coordinates Source lat not valid",

    });
}
if (coordinates_splited[0][1] >= -100 && coordinates_splited[0][1] <= 100){

}else{
    res.status(400).json({
        message : "Coordinates Source lon not valid",

    });
}
if (coordinates_splited[1][0] >= -90 && coordinates_splited[1][0] <= 90){

}else{
    res.status(400).json({
        message : "Coordinates Target lat not valid",

    });
}
if (coordinates_splited[1][1] >= -100 && coordinates_splited[1][1] <= 100){

}else{
    res.status(400).json({
        message : "Coordinates Target lon not valid",

    });
}

res.status(400).json({
    message:"Vehicle is invalid",
});