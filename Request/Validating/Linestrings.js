function validating_linestring (res, linestring){

    //Check if the linestring is defined 
    if (linestring === undefined){
        res.status(400).json({
            message:"Linestring is undefined",
        });
    }else{
        //Point for check up
    }

    console.log(linestring);
    
    //Checking there is no other number between 1 or 0 
    if (/^[01]$/.test(linestring)) {
        return parseInt(linestring,10);
    } 
    else {
        return res.status(400).json({
            message : "linestring is not valid. It should be either 0 or 1.",

        });;
    }
}

module.exports = {validating_linestring};