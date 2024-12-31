'use strict';

const accounts = [
  {
    owner: 'Salah AbuFarha',
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2, // %
    pin: 1111,
    type: 'premium',
    movementsDates: [
      '2024-01-28T09:15:04.904Z',
      '2024-04-01T10:17:24.185Z',
      '2024-05-08T14:11:59.604Z',
      '2024-07-26T17:01:17.194Z',
      '2024-07-28T23:36:17.929Z',
      '2024-08-01T10:51:36.790Z',
      '2024-11-18T21:31:17.178Z',
      '2024-12-23T07:42:02.383Z',
    ],
  },
  {
    owner: 'Mohamad Jamal',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
    type: 'standard',
    movementsDates: [
      '2024-01-28T09:15:04.904Z',
      '2024-04-01T10:17:24.185Z',
      '2024-05-08T14:11:59.604Z',
      '2024-07-26T17:01:17.194Z',
      '2024-07-28T23:36:17.929Z',
      '2024-08-01T10:51:36.790Z',
      '2024-11-18T21:31:17.178Z',
      '2024-12-23T07:42:02.383Z',
    ],
  },
];

const form = document.querySelector('.form');
const input_user = document.querySelector('.user');
const input_pass = document.querySelector('.pin');
const transferTo = document.getElementById('input_to');
const amountTo = document.getElementById('input_amount');
const loan = document.getElementById('loan');
const user = document.getElementById('users');
const pass = document.getElementById('pass');
const app = document.querySelector('.app');
const balance = document.querySelector('.balance');
const movements = document.querySelector('.movements');
const labelWelcome = document.querySelector('.header-heading');
const date = document.querySelector('.date');
const time = document.querySelector('.time');
const summary_in = document.querySelector('.summary-in');
const summary_out = document.querySelector('.summary-out');
const summary_int = document.querySelector('.summary-int');
const form_transfer = document.querySelector('.form_transfer');
const form_loan = document.querySelector('.form_loan');
const form_close = document.querySelector('.form_close');
const sort = document.querySelector('.sort');

const createUsernama = acc => {
  acc.forEach(el => {
    el.username = el.owner
      .toLowerCase()
      .split(' ')
      .map(e => e[0])
      .join('');
  });
};

createUsernama(accounts);

console.log(accounts);
const formDate = date => {
  return new Intl.DateTimeFormat('en-us', {
    year: '2-digit',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(date));
};

let timers;
const clock_timer = () => {
  let timer = 300;
  const id = setInterval(() => {
    date.textContent = formDate(new Date());
    const m = String(Math.trunc(timer / 60)).padStart(2, 0);
    const s = String(Math.trunc(timer % 60)).padStart(2, 0);
    time.textContent = `${m}:${s}`;
    timer--;
    if (timer < 1) {
      clearInterval(id);
      app.style.opacity = 0;
    }
  }, 1000);
  timers = id;
  return timers;
};

const displayBalance = acc => {
  acc.balance = acc.movements.reduce((a, b) => a + b, 0);
  balance.textContent = `${acc.balance.toLocaleString()}€`;
};
const displaySummary = acc => {
  const sumIn = acc.movements.filter(mov => mov > 0).reduce((a, b) => a + b, 0);
  const Int = acc.movements
    .filter(mov => mov > 0)
    .map(e => e * (acc.interestRate / 100))
    .reduce((a, b) => a + b, 0);
  const sumOut = acc.movements
    .filter(mov => mov < 0)
    .reduce((a, b) => a + b, 0);
  summary_in.textContent = `${sumIn.toLocaleString()}€`;
  summary_out.textContent = `${Math.abs(sumOut).toLocaleString()}€`;
  summary_int.textContent = `${Int.toLocaleString()}€`;
};
const displayMovements = acc => {
  movements.innerHTML = ' ';
  acc.movements.forEach((v, i) => {
    const type = v > 0 ? 'deposit' : 'withdrawal';
    let html = `
        <div class="movement">
        <h2 class="movement_heading">
        <span class="${type}">${i + 1} ${type}</span>
        <span class="days">${formDate(acc.movementsDates[i])} </span>
        </h2>
        <p class="amount">${Math.abs(v).toLocaleString()}€</p>
        </div>`;
    movements.insertAdjacentHTML('afterbegin', html);
  });
};

const apps = acc => {
  displayBalance(acc);
  displayMovements(acc);
  displaySummary(acc);
};
let currentAcc;
form.addEventListener('submit', e => {
  e.preventDefault();
  currentAcc = accounts.find(acc => acc.username === input_user.value);
  const pin = +input_pass.value;
  if (currentAcc.username === input_user.value && currentAcc.pin === pin) {
    app.style.opacity = 1;
    labelWelcome.textContent = `Welcome back ${currentAcc.owner.split(' ')[0]}`;
    if (timers) clearInterval(timers);
    clock_timer();
    apps(currentAcc);
    input_pass.value = input_user.value = '';
  }
});

form_transfer.addEventListener('submit', e => {
  e.preventDefault();
  const reciverAcc = accounts.find(acc => acc.username === transferTo.value);
  const amount = +amountTo.value;
  if (
    reciverAcc.username !== currentAcc.username &&
    amount > 0 &&
    amount < currentAcc.balance
  ) {
    reciverAcc.movements.push(amount);
    reciverAcc.movementsDates.push(new Date());
    currentAcc.movements.push(-amount);
    currentAcc.movementsDates.push(new Date());
    transferTo.value = amountTo.value = '';
    apps(currentAcc);
  }
});
form_loan.addEventListener('submit', e => {
  e.preventDefault();
  const amount = +loan.value;
  const max_loan = currentAcc.balance * 1.25;
  if (amount > 0 && amount < max_loan) {
    currentAcc.movements.push(amount);
    currentAcc.movementsDates.push(new Date());
    loan.value = '';
    apps(currentAcc);
    loan.setAttribute('disabled', true);
  }
});
form_close.addEventListener('submit', e => {
  e.preventDefault();
  const index = accounts.findIndex(acc => acc.username === user.value);
  const pin = +pass.value;
  if (currentAcc.username === user.value && currentAcc.pin === pin) {
    user.value = pass.value = '';
    accounts.splice(index, 1);
    app.style.opacity = 0;
  }
});

let sorted = true;
sort.addEventListener('click', e => {
  e.preventDefault();
  sorted
    ? currentAcc.movements.sort((a, b) => a - b)
    : currentAcc.movements.sort((a, b) => a + b);

  sorted = !sorted;
  apps(currentAcc);
});
