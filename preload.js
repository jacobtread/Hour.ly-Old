// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('minimize').onclick = () => {
        ipcRenderer.send('minimize')
    }
    document.getElementById('close').onclick = () => {
        ipcRenderer.send('close')
    }

    const actionButton = document.getElementById('action');
    const elapsedTime = document.getElementById('elapsed');
    const historyElm = document.getElementById('history');
    const total = document.getElementById('total');

    let started = false;
    let startedAt = 0
    let history = []

    document.getElementById('action').onclick = function () {
        started = !started
        if (started) {
            actionButton.classList.add('started')
            startedAt = performance.now()
        } else {
            actionButton.classList.remove('started')
            const time = performance.now()
            const diff = time - startedAt
            history.push(diff)
            updateHistory()
        }
    }

    function updateHistory() {
        historyElm.innerHTML = ''
        let totalTime = 0
        for (let i = history.length - 1; i >= 0; i--) {
            const element = history[i];
            const html = document.createElement('li')
            html.innerText = getPrettyValue(element)
            historyElm.appendChild(html)
            totalTime += element
        }
        total.innerText = getPrettyValue(totalTime)
        ipcRenderer.send('save', history)
    }

    ipcRenderer.send('load')

    ipcRenderer.on('load-state', function (event, args) {
        history = args
        updateHistory()
    })

    function getPrettyValue(value) {
        if (value / 3600000 > 1) /* hours */ {
            return (value / 3600000).toFixed(1) + 'h'
        } else if (value / 60000 > 1) /* minutes */{
            return (value / 60000).toFixed(0) + 'm'
        } else /* seconds*/ {
            return (value / 1000).toFixed(0) + 's'
        }
    }

    setInterval(() => {
        if (started) {
            const time = performance.now()
            const passed = time - startedAt
            elapsedTime.innerText = getPrettyValue(passed)
        }
    }, 100)
})
