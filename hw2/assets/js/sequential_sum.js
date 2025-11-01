const func = (num) => {
    const count = (...args) => {
        for (const val of args) {
            num += Number(val);
        }
        return count;
    };


    count.plus = (x) => (num += x, count);
    count.minus = (x) => (num -= x, count);
    count.multiply = (x) => (num *= x, count);
    count.divide = (x) => (num /= x, count);

    count.valueOf = () => num;
    count.clone = () => func(structuredClone(num));
    
    return count;
};

function insertToHtml(value) {
  const div = document.getElementById('func');
  if (div) {
    div.textContent += value + '\n';
    console.log(value);
  }
}


insertToHtml(+func(15)(7)- 6*2);

const og = func(1)(2)(3).plus(4).multiply(2).minus(9);
const clone = og.clone()(1).plus(.5).plus(1.5).minus(2);
insertToHtml(og.valueOf());
insertToHtml(clone.valueOf());