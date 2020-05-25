var postNumber = ''
var enabled = false
var nbrOfDays = 3
var riskGroup = false
var timeHandler = null

function main() {
  sendRequest(0)
  sendRequest(1)
  sendRequest(2)

  timeHandler = setTimeout(main, 20000)
}

function alarm(isDryRun) {
  var myAudio = new Audio(chrome.runtime.getURL("beep-01a.mp3"));
  myAudio.play();

  let repeat = isDryRun ? 1 : 5
  function replay() {
    myAudio.play();
    repeat--
    if (repeat === 0) {
      myAudio.removeEventListener('ended', replay)
    }
  }
  myAudio.addEventListener('ended', replay)
}

function avaiabilityFilter(a) {
  if (riskGroup) {
    return a.isAvailable === true 
  } else {
    return a.isAvailable === true && !a.name.includes('SPECIAL')
  }
}

function daysInRange(date, nbrOfDays) {
  validDateArr = []
  for (let i = 0; i<nbrOfDays; i++) {
    let today = new Date()
    let newDay = new Date(today)
    newDay.setDate(newDay.getDate() + i)
    let date = newDay.getDate()
    let month = newDay.getMonth() + 1
    validDateArr.push(`${date}/${month}`)
  }

  return validDateArr.includes(date)
}

function sendRequest(weekIndex) {
  console.log('trying to fetch new time slots at week ${weekIndex}...')
  var oReq = new XMLHttpRequest();
  oReq.open("GET", `https://www.ica.se/handla/cart/frags/getShippingSlots.jsp?deliveryReserved=true&orderId=&checkoutDisabled=&checkForCapacityOff=&getSubscriptionSlots=&getEditSubscriptionSlots=&postCode=${postNumber}&slotType=2&weekIndex=${weekIndex}`);
  oReq.onload = function(e) {
    let o = JSON.parse(oReq.response)
    let available = false
    let datesInRage = o.dates.filter(a => daysInRange(a.date, nbrOfDays))
    let notifyString = null
    console.log(`get below data in ${nbrOfDays} days:`)
    console.log(datesInRage)
    for (let i in datesInRage) {
      day = datesInRage[i]
      var availableDays = day.availability.filter(avaiabilityFilter)
      if (availableDays.length > 0) {
        notifyString = `found new time slot at ${day.date}-${availableDays[0].hours}!`
        console.log(notifyString)
        alarm(false)
        notifyMe(notifyString)
        clearTimeout(timeHandler)
        loadConfigurations()
        available=true
        break   
      }
    }

    if (!available) {
      console.log('no time slot found, sleeping...')
      loadConfigurations()
    }
  }

  oReq.send();
}

function notifyMe(message) {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(message);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(message);
      }
    });
  }
}

function loadConfigurations() {
  chrome.storage.sync.get('icaPostNumber', function(data) {
    postNumber = data.icaPostNumber || '19164'
  })

  chrome.storage.sync.get('icaNbrOfDays', function(data) {
    nbrOfDays = data.icaNbrOfDays === undefined ? 3 : data.icaNbrOfDays
  })

  chrome.storage.sync.get('icaIfEnabled', function(data) {
    enabled = data.icaIfEnabled === undefined ? true : data.icaIfEnabled
  })

  chrome.storage.sync.get('icaIfRiskGroup', function(data) {
    riskGroup = data.icaIfRiskGroup===undefined?true:data.icaIfRiskGroup
  })
}

window.addEventListener('DOMContentLoaded', function () {
    if(document.readyState !== 'complete') {
        console.log('not ready yet')
        document.onreadystatechange = function () {
            if(document.readyState === 'complete') {
                console.log('completed!')
                if (Notification.permission !== "granted") {
                  Notification.requestPermission()
                }

                loadConfigurations()
                setTimeout(() => {
                  console.log(`postNumber=${postNumber}, nbrOfDays=${nbrOfDays}, enabled=${enabled}, riskGroup=${riskGroup}`)
                  if (enabled === true) {
                    alert("Click anywhere on the page to test playing audio.")
                    function test() {
                      alarm(true)
                      main()
                      document.removeEventListener('click', test)
                    }
                    document.addEventListener('click', test)
                  }
                }, 1000)
            }
        }
    }
})
