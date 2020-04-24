var postNumber = ''
var enabled = false
var checkNextWeek = false
var timeHandler = null

function main() {
  sendRequest(0)
  if (checkNextWeek === true) {
    sendRequest(1)
  }
  timeHandler = setTimeout(main, 20000)
}

function alarm(isDryRun) {
  var myAudio = new Audio(chrome.runtime.getURL("beep-01a.mp3"));
  myAudio.play();

  let repeat = isDryRun ? 1 : 10
  function replay() {
    myAudio.play();
    repeat--
    if (repeat === 0) {
      myAudio.removeEventListener('ended', replay)
    }
  }
  myAudio.addEventListener('ended', replay)
}

function sendRequest(weekIndex) {
  console.log('send Request')
  var oReq = new XMLHttpRequest();
  oReq.open("GET", `https://www.ica.se/handla/cart/frags/getShippingSlots.jsp?deliveryReserved=true&orderId=&checkoutDisabled=&checkForCapacityOff=&getSubscriptionSlots=&getEditSubscriptionSlots=&postCode=${postNumber}&slotType=2&weekIndex=${weekIndex}`);
  oReq.onload = function(e) {
    let o = JSON.parse(oReq.response)
    let available = false
    o.dates.forEach(day => {
      console.log(day)
      let availableDays = day.availability.filter(a => a.isAvailable === true)
      console.log(availableDays)
      if (availableDays.length > 0) {
        available = true
      }
    })
    if (available === true) {
      console.log('find new time slot!')
      notifyMe()
      alarm(false)
      clearTimeout(timeHandler)
    } 
  }
  oReq.send();
}

function notifyMe() {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification("There is new time slot!");
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification("There is new time slot!");
      }
    });
  }
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

                chrome.storage.sync.get('icaPostNumber', function(data) {
                  postNumber = data.icaPostNumber || '19164'
                })

                chrome.storage.sync.get('icaIfCheckNextWeek', function(data) {
                  checkNextWeek = data.icaIfCheckNextWeek || true
                })

                chrome.storage.sync.get('icaIfEnabled', function(data) {
                  enabled = data.icaIfEnabled || true
                })

                setTimeout(() => {
                  console.log(`postNumber=${postNumber}, checkNextWeek=${checkNextWeek}, enabled=${enabled}`)
                  if (enabled === true) {
                    alert("Click anywhere on the page to test playing audio from an extension.")
                    document.addEventListener('click', () => {
                      alarm(true)
                      main()
                    })
                  }
                }, 1000)
            }
        }
    }
})
