const out = document.getElementById('out');
const demoEl = document.getElementById('demoEl');

function log(mes) {
    const timestamp = new Date().toLocaleTimeString();
    out.innerHTML += `[${timestamp}] ${mes}<br>`;
    console.log(mes);
}




function startMe() {
    out.innerHTML = '';
    demoEl.style.backgroundColor = '#6c757d';
    demoEl.textContent = 'Оппа... Я меняюсь!';
            
    log('Начало через: 3...');

    setTimeout(() => {
        log('1. Макро задача начало'); 

        Promise.resolve().then(() => {
            log('1.1.микрозадача промис');
        });
        requestAnimationFrame(() => {
            demoEl.style.backgroundColor = '#007bff';
            demoEl.style.transform = 'scale(1.2)';
            log('  1.2. рендер задачи');
        });

        log('1.Макро задача конец');
    }, 1000);

    setTimeout(() => {
        log('2. Макро задача начало');
                
        Promise.resolve().then(() => {
                log('  2.1. микрозадача промис');
        });
        Promise.resolve().then(() => {
            log(' 2.2. микрозадача промис');
        });

        log('2. Макро задача конец');
    }, 2000);

    setTimeout(() => {
        log('3.Макро задача начало');
                
        Promise.resolve().then(() => {
            log(' 3.1. микрозадача промис');
        });
        requestAnimationFrame(() => {
            demoEl.textContent = 'Вот и всё! Я поменялся)';
            demoEl.style.backgroundColor = '#28a745';
            demoEl.style.transform = 'scale(1)';
            log(' 3.2. произошло изменение содержания');
        });

        log('3.Макро задача конец');
    }, 3000);

    Promise.resolve().then(() => {
        log('1... Погнали!');
    });

    log('2...');
}

window.onload = () => {
        log('Страница загружена. Нажмите кнопку для запуска');
};