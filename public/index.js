// === nav bar: top-menu and sub-menu ==============
// menu data structure
var menuLinks = [
    { text: 'about', href: '/about' }, 
    { text: 'locations', href: '#', subLinks: [
        {text: 'all', href: '/locations/all'},
        {text: 'adults', href: '/locations/adults'},
        {text: 'children', href: '/locations/children'},
        {text: 'quick links', href: '/locations/quick'}
    ]},
    { text: 'find a doctor', href: '#', subLinks: [
        {text: 'all', href: '/doctor/all'},
        {text: 'adults', href: '/doctor/adults'},
        {text: 'children', href: '/doctor/children'},
        {text: 'quick links', href: '/doctor/quick'}
    ]},
    { text: 'patients & visitors', href: '#', subLinks: [
        {text: 'FAQs', href: '/patients/faqs'},
        {text: 'schedule appointments online', href: '/patients/schedule-online'}, 
        {text: 'quick links', href: '/patients/quick'},
        {text: 'contact us', href: '/patients/contactus'}
    ]},
    { text: 'my health account', href: '/myaccount'}
]

// top-menu
const topMenuEl = document.getElementById('top-menu');
topMenuEl.style.height = "100%";
topMenuEl.style.backgroundColor = 'var(--top-menu-bg)';
topMenuEl.classList.add('flex-around');

helperBuildMenu(menuLinks, topMenuEl);

// -- helper function to build menu elements for all top-menu & sub-menu
function helperBuildMenu(links, menuEl) {
    menuEl.innerHTML = "";
    links.forEach((link) => {
        const anchor = document.createElement('a');
        anchor.setAttribute('href', link.href);
        anchor.textContent = link.text;
        menuEl.appendChild(anchor);
    })
}

// sub-menu
const subMenuEl = document.querySelector('#sub-menu');
subMenuEl.style.height = "100%";
subMenuEl.style.backgroundColor = 'var(--sub-menu-bg)';
subMenuEl.classList.add('flex-around');
subMenuEl.style.position = "absolute";
subMenuEl.style.top = "0";

// -- helper function for all addEventListener
function addGlobalEventListener(element, type, selector, callback) {
    element.addEventListener(type, e => {
        e.preventDefault();
        if (e.target.tagName !== 'A') { return; }

        e.target.classList.toggle('active');

        if (e.target.matches(selector)) callback(e)

        topMenuLinks.forEach(function(link) {
            link.classList.remove('active');
        })
    })
} 

// interaction between top-menu & sub-menu
const topMenuLinks = topMenuEl.querySelectorAll('a');
addGlobalEventListener(topMenuEl, 'click', 'a', e => {
    const hasSubLinks = menuLinks.find((link) => link.text === e.target.textContent).subLinks;

        if (e.target.classList !== 'active') {
            if (hasSubLinks) {
                subMenuEl.style.top = "100%";
                helperBuildMenu(hasSubLinks, subMenuEl);
            } else {
                subMenuEl.style.top = "0";
            }
        }
})

addGlobalEventListener(subMenuEl, 'click', 'a', e => {
    if (subMenuEl.style.top === "100%") {
        subMenuEl.style.top = "0";
    }
})


// === left: select date, time slots, local time ===============================
let openHours = document.getElementById('open');
const timeSlotsContainers = document.querySelectorAll('.time-slots');

// hide time slots initially
timeSlotsContainers.forEach(container => container.style.display = 'none');

// handle date change
let field = document.querySelector('#date')
field.min = new Date().toISOString().split('T')[0];

date.addEventListener('input', function () {
    let date = new Date(`${field.value}T00:00`);
    // console.log(date.getDay());

    // clear previous dateDemo if there is a next sibling
    if (field.nextSibling) {
        let previousDateDemo = document.querySelector('#dateDemo');
        if (previousDateDemo) {
            previousDateDemo.remove();
        }
    }

    // create and append new dateDemo
    const dateDemo = document.createElement('div');
    dateDemo.id = 'dateDemo';
    dateDemo.style.padding = '10px 0';
    dateDemo.textContent = `${date.toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}`;
    field.parentNode.insertBefore(dateDemo, field.nextSibling);

    // update the operation hours on that day
    if (date.getDay() === 0 || date.getDay() === 6) {
        openHours.innerHTML = 'Select a Time between 9AM and 6PM EST';
    } else {
        openHours.innerHTML = 'Select a Time between 8AM and 8PM EST';
    }

    // update available time
    // Call the function to generate time slots
    generateTimeSlots(date);
    // show time slots
    timeSlotsContainers.forEach(container => container.style.display = 'block');

    // TODO: once the available time is full, remove that time slot
})

// Function to generate time slots
function generateTimeSlots(date) {
    timeSlotsContainers.forEach(container => {
        // clear previous content
        container.innerHTML = '';

        // setup startTime and endTime for time slots
        const startTime = new Date(date);
        startTime.setHours(8, 0, 0, 0);
        // console.log(startTime);
        const endTime = new Date(date);
        endTime.setHours(20, 0, 0, 0);
        const interval = 20;

        // check if it's a weekend, adjust working hours accordingly
        if (date.getDay() === 0 || date.getDay() === 6) {
            startTime.setHours(9, 0, 0, 0);
            endTime.setHours(18, 0, 0, 0);
        } 

        // check if it is today, reset the start time after current local time
        if (date.toDateString() === new Date().toDateString()) {
            const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
            const nextSlotTime = Math.ceil(currentTime / 20) * 20;
            startTime.setHours(Math.floor(nextSlotTime / 60), nextSlotTime % 60, 0, 0);
        }

        // create a document fragment to hold the time slots
        const fragment = document.createDocumentFragment();

        // loop through time slots
        while (startTime < endTime) {
            // create a box for each time slot
            const timeSlot = document.createElement('div');
            timeSlot.classList.add('time-slot');
            timeSlot.textContent = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // add event listener to change attribute on click
            timeSlot.addEventListener('click', function() {
                // deselect all time slots
                document.querySelectorAll('.time-slot').forEach(slot => {
                    slot.removeAttribute('data-selected');
                    slot.style.backgroundColor = '';
                });

                // select the clicked time slot
                timeSlot.setAttribute('data-selected', 'true');
                timeSlot.style.backgroundColor = '#5aa9e6';
            });

            // append the time slot to the fragment
            fragment.appendChild(timeSlot);
            // container.appendChild(timeSlot);

            // move to the next time slot
            startTime.setMinutes(startTime.getMinutes() + interval);
        }

        // append the fragment with all time slots to the container
        container.appendChild(fragment);
    });
}

// current local time
setInterval(myTimer, 1000);
function myTimer () {
    const d = new Date();
    document.getElementById('current-time').innerHTML = `Current Local Time: ${new Date().toDateString()} ${d.toLocaleTimeString()}`;
}


// === right: information form ======================================
// form validation
// radio button validation: only one radio buton is checked
document.querySelectorAll('input[type="radio"][name="gender"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.checked) {
            document.querySelectorAll('input[type="radio"][name="gender"]').forEach(otherRadio => {
                if (otherRadio !== this) {
                    otherRadio.checked = false;
                }
            });
        }
    });
});

// alert when clicks submit button
document.getElementById('submit').addEventListener('click', function() {
    const form = document.querySelector('form');
    if (form.checkValidity()) {
        alert('You have successfully scheduled your visit!');
    } else {
        alert('Please fill in all required fields and agree to the Terms of Use.');
    }
})

// window.confirm when clicks back button
document.getElementById('back').addEventListener('click', function () {
    const confirmBack = window.confirm('Your information is not saved. The appointment is not saved. Are you sure you want to go back?');
    if (confirmBack) {
        window.history.back();
    }
});