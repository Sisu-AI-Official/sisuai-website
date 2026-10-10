// Sisu Voice landing page: sample-call tabs and mobile menu.
// Calls are shown in Vietnamese (as Sisu Voice speaks them) with an English translation.
const CUSTOMER = 'Customer';

const examples = {
  spa: {
    context: 'Spa example',
    lines: [
      { who: 'Sisu Voice', text: 'Em chào chị! Em là lễ tân của spa. Em có thể hỗ trợ mình tìm dịch vụ hoặc đặt lịch ạ.', en: "Hello! I'm the spa's receptionist. I can help you find a service or book an appointment." },
      { who: CUSTOMER, text: 'Chị muốn hỏi về liệu trình chăm sóc da và đặt lịch cuối tuần.', en: "I'd like to ask about your facial treatments and book for the weekend." },
      { who: 'Sisu Voice', text: 'Dạ được ạ. Em có thể giới thiệu các liệu trình trong bảng dịch vụ của spa và kiểm tra lịch trống cho chị. Chị muốn đến vào thứ Bảy hay Chủ nhật ạ?', en: 'Of course. I can walk you through the treatments on our menu and check open slots. Would Saturday or Sunday suit you?' },
      { who: CUSTOMER, text: 'Thứ Bảy, khoảng 3 giờ chiều nhé.', en: 'Saturday, around 3 pm please.' }
    ],
    title: 'Appointment captured',
    description: 'The customer picks a time after hearing about the service.',
    details: [['Service', 'Facial treatment'], ['Time', 'Saturday · 15:00'], ['Confirmation', 'Zalo / SMS']],
    next: 'Send a confirmation via Zalo / SMS and call to remind the customer before the appointment.'
  },
  clinic: {
    context: 'Clinic example',
    lines: [
      { who: 'Sisu Voice', text: 'Em chào anh! Em là lễ tân của phòng khám. Anh cần hỏi giờ làm việc hay đặt lịch khám ạ?', en: "Hello! I'm the clinic's receptionist. Would you like to check our opening hours or book an appointment?" },
      { who: CUSTOMER, text: 'Cho anh hỏi phòng khám có làm việc sáng thứ Sáu không?', en: 'Is the clinic open on Friday morning?' },
      { who: 'Sisu Voice', text: 'Em sẽ đối chiếu giờ làm việc mà phòng khám cung cấp. Nếu phù hợp, em có thể giúp anh chọn lịch hẹn.', en: "Let me check the clinic's opening hours. If it works for you, I can help you pick a time." },
      { who: CUSTOMER, text: 'Vậy giúp anh đặt một lịch buổi sáng nhé.', en: 'Then please book me a morning slot.' }
    ],
    title: 'Booking request captured',
    description: 'The caller gets the opening hours before choosing a slot.',
    details: [['Request', 'Check-up booking'], ['Time', 'Friday morning'], ['Confirmation', 'Zalo / SMS']],
    next: 'Send the booking details and remind the patient before the appointment.'
  },
  restaurant: {
    context: 'Restaurant example',
    lines: [
      { who: 'Sisu Voice', text: 'Xin chào! Em là lễ tân nhà hàng. Em có thể giúp mình hỏi thực đơn, giờ mở cửa hoặc đặt bàn ạ.', en: "Hello! I'm the restaurant's receptionist. I can help with the menu, opening hours or a table booking." },
      { who: CUSTOMER, text: 'Tối mai bên mình còn bàn cho bốn người không?', en: 'Do you have a table for four tomorrow evening?' },
      { who: 'Sisu Voice', text: 'Dạ, em sẽ kiểm tra lịch đặt bàn. Mình muốn dùng bữa khoảng mấy giờ ạ?', en: "Let me check our bookings. What time would you like to dine?" },
      { who: CUSTOMER, text: 'Khoảng 7 giờ tối, nếu còn bàn nhé.', en: 'Around 7 pm, if there is a table.' }
    ],
    title: 'Table request captured',
    description: 'The caller gives party size and time in a single call.',
    details: [['Guests', '4 people'], ['Time', 'Tomorrow · 19:00'], ['Confirmation', 'Zalo / SMS']],
    next: 'Send the booking details once the table is confirmed.'
  }
};

function renderExample(key) {
  const data = examples[key];
  if (!data) return;
  const body = document.querySelector('#conversation-body');
  body.replaceChildren();
  for (const line of data.lines) {
    const row = document.createElement('div');
    row.className = `bubble-row ${line.who === CUSTOMER ? 'customer' : 'assistant'}`;
    if (line.who !== CUSTOMER) {
      const icon = document.createElement('span');
      icon.className = 'bubble-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = 'S';
      row.append(icon);
    }
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const label = document.createElement('span');
    label.className = 'bubble-label';
    label.textContent = line.who;
    const text = document.createElement('span');
    text.lang = 'vi';
    text.textContent = line.text;
    const translation = document.createElement('span');
    translation.className = 'bubble-translation';
    translation.textContent = line.en;
    bubble.append(label, text, translation);
    row.append(bubble);
    body.append(row);
  }
  document.querySelector('#demo-context').textContent = data.context;
  document.querySelector('#outcome-title').textContent = data.title;
  document.querySelector('#outcome-description').textContent = data.description;
  document.querySelector('#outcome-next').textContent = data.next;
  const details = document.querySelector('#outcome-details');
  details.replaceChildren();
  for (const [name, value] of data.details) {
    const row = document.createElement('div');
    row.className = 'detail-row';
    const label = document.createElement('span');
    label.textContent = name;
    const detail = document.createElement('span');
    detail.textContent = value;
    row.append(label, detail);
    details.append(row);
  }
  document.querySelectorAll('.demo-tab').forEach(tab => {
    const selected = tab.dataset.demo === key;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
}

document.querySelectorAll('.demo-tab').forEach(tab => {
  tab.addEventListener('click', () => renderExample(tab.dataset.demo));
  tab.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const tabs = [...document.querySelectorAll('.demo-tab')];
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(tabs.indexOf(tab) + offset + tabs.length) % tabs.length];
    renderExample(next.dataset.demo);
    next.focus();
  });
});
renderExample('spa');

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  nav.classList.toggle('is-open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  nav.classList.remove('is-open');
}));
