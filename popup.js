'use strict';

let enabled = document.getElementById('enabled')
let checkNextWeek = document.getElementById('nextweek')
let postNumber = document.getElementById('postnumber')


chrome.storage.sync.get('icaPostNumber', function(data) {
  postNumber.value = data.icaPostNumber || '19164'
})

chrome.storage.sync.get('icaIfCheckNextWeek', function(data) {
  checkNextWeek.checked = data.icaIfCheckNextWeek || true
})

chrome.storage.sync.get('icaIfEnabled', function(data) {
  enabled.checked = data.icaIfEnabled || true
})

enabled.onchange = function(element) {
  let ifEnabled = element.target.checked
  console.log('checked')
  chrome.storage.sync.set({icaIfEnabled: ifEnabled}, function(data) {
    console.log(`save to storage icaIfEnabled: ${ifEnabled}`)
  })
}

checkNextWeek.onchange = function(element) {
  let ifCheckNextWeek = element.target.checked
  chrome.storage.sync.set({icaIfCheckNextWeek: ifCheckNextWeek}, function(data) {
    console.log(`save to storage icaIfCheckNextWeek: ${ifCheckNextWeek}`)
  })
}

postNumber.onchange = function(element) {
  let thePostNumber = element.target.value
  chrome.storage.sync.set({icaPostNumber: thePostNumber}, function(data) {
    console.log(`save to storage icaPostNumber: ${thePostNumber}`)
  })
}
