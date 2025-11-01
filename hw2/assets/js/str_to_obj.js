


function BuildNestedObject(str) {

    if (str.endsWith('.')) {
        str = str.slice(0, -1);
    }

    const parts = str.split('.');
    for (let i = 0; i < parts.length; i++) {
        if(parts[i].trim() === ""){
            parts.splice(i, 1);
            i--;
        }
    }

    function recursive_func(arr) {
        if(arr.length === 0) {
            return {};
        }
        const [firstEl, ...remainingStr] = arr;
        return {
            [firstEl]: recursive_func(remainingStr)
        };
    }

    return recursive_func(parts);
}

const str = "Привет! Меня зовут Даниил Брантов.Мне 21 год. I wanna work in ur company... 🤓.%$@. .  . А это конец обьекта и моего тестового.";

document.getElementById('btn_convert').addEventListener('click', function() {
    const str = document.getElementById('input_str').value;
    const resultObj = new BuildNestedObject(str);
    const container = document.getElementById('str_to_obj');
    container.innerHTML = '<pre>' + JSON.stringify(resultObj, null, 2) + '</pre>';
    console.log(resultObj);

});

