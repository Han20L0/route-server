function validating_priorities(res, priorities) {
  //Check if the priorities is defined
  if (priorities === undefined) {
    res.status(400).json({
      message: "Priorities is undefined",
    });
  }

  //spliting first
  const priorities_int = priorities.split("").map((priorities_intpriorities) => parseInt(priorities_intpriorities.trim()));

  //checking if there is no more that 4 number
  if (priorities_int.length !== 4) {
    res.status(400).json({
      message: "Priorities is not valid, it can be that the length is no more than 4 or more than 4",
    });
  }

  //Checking if the input is integer
  for (let i = 0; i < priorities_int.length; i++) {
    if (typeof priorities_int[i] !== "number" || !Number.isInteger(priorities_int[i])) {
      res.status(400).json({
        message: "Priorities is not valid, it can be that the input is not an integer",
      });
    }
  }

  //checking if there is no duplicate number
  for (let i = 0; i < priorities_int.length; i++) {
    for (let j = i + 1; j < priorities_int.length; j++) {
      if (priorities_int[i] === priorities_int[j]) {
        res.status(400).json({
          message: "there is some duplicate number, no duplicate please",
        });
      }
    }
  }

  return priorities_int;
}

module.exports = { validating_priorities };
