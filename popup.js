'use strict';

let inputEnabled = document.getElementById('enabled')
let inputNbrOfDays = document.getElementById('nbrOfDays')
let inputPostNumber = document.getElementById('postnumber')
let inputRiskGroup = document.getElementById('riskgroup')

chrome.storage.sync.get('icaPostNumber', function(data) {
  inputPostNumber.value = data.icaPostNumber || '19164'
})

chrome.storage.sync.get('icaNbrOfDays', function(data) {
  inputNbrOfDays.value = data.icaNbrOfDays === undefined ? 3 : data.icaNbrOfDays
})

chrome.storage.sync.get('icaIfEnabled', function(data) {
  inputEnabled.checked = data.icaIfEnabled === undefined ? true : data.icaIfEnabled
})

chrome.storage.sync.get('icaIfRiskGroup', function(data) {
  inputRiskGroup.checked = data.icaIfRiskGroup === undefined ? true : data.icaIfRiskGroup
})

inputEnabled.onchange = function(element) {
  let ifEnabled = element.target.checked
  console.log('checked')
  chrome.storage.sync.set({icaIfEnabled: ifEnabled}, function(data) {
    console.log(`save to storage icaIfEnabled: ${ifEnabled}`)
  })
}

inputNbrOfDays.onchange = function(element) {
  let nbrOfDays = element.target.value
  chrome.storage.sync.set({icaNbrOfDays: nbrOfDays}, function(data) {
    console.log(`save to storage icaNbrOfDays: ${nbrOfDays}`)
  })
}

inputPostNumber.onchange = function(element) {
  let thePostNumber = element.target.value
  chrome.storage.sync.set({icaPostNumber: thePostNumber}, function(data) {
    console.log(`save to storage icaPostNumber: ${thePostNumber}`)
  })
}

inputRiskGroup.onchange = function(element) {
  let ifRiskGroup = element.target.checked
  chrome.storage.sync.set({icaIfRiskGroup: ifRiskGroup}, function(data) {
    console.log(`save to storage icaIfRiskGroup: ${ifRiskGroup}`)
  })
}