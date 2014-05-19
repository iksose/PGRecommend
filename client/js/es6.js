console.log("hmm")

var evens = [2,4,6,8];
var odds = evens.map(v => v + 1);
var nums = evens.map((v, i) => v + i);

console.log("Nums", nums)

//let i = 9;

//console.log(i)


var melter = function(obj){
  var temp = obj
  temp.melted = "melted"
  // return obj.melted = "melted"
  return temp;
}
let empty = () => {};


class Car {
    constructor(make) { //constructors!
      this.make = make;
      this.currentSpeed = 25;
    }

    printCurrentSpeed(){
          console.log(this.make + ' is going ' + this.currentSpeed + ' mph.');
    }
}

class RaceCar extends Car { //inheritance
    constructor(make, topSpeed) {
        super(make); //call the parent constructor with super
        this.topSpeed = topSpeed;
    }

    goFast(){
          this.currentSpeed = this.topSpeed;
    }
}

let stang = new RaceCar('Mustang', 150);
let prius = new Car('Prius', 100)

stang.printCurrentSpeed();
stang.goFast();
stang.printCurrentSpeed();

prius.printCurrentSpeed();


var num = 0; //globally scoped

for (let i = 0; i < 10; i++) { //i is block scoped
  num += i;
  console.log('value of i in block: ' + i);
}

console.log('Is i defined here?: ' + (typeof i !== 'undefined')); //Is i defined here?: false
