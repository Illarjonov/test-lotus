import { useState, useEffect } from 'react'
import './App.css'
import { clearInterval, setInterval } from 'worker-timers'
//Некоторые браузеры (напр. Safari, Chrome), приостанавливают JS-таймеры 
//или замедляют их выполнение при работе в фоне, для этого поставил Web Workers
//

const dataUsers = [
  { name: "ХимПром", standart: "-", deadline: "80", surety: "24", termsPayments: "50%", prices: ["3 700 000 руб", "-25 000 руб", "2 475 000 руб"] },
  { name: "Метафракс", standart: "-", deadline: "75", surety: "12", termsPayments: "60%", prices: ["3 200 000 руб", "-25 000 руб", "2 475 000 руб"] },
  { name: "Фабрика", standart: "-", deadline: "120", surety: "36", termsPayments: "100%", prices: ["2 800 000 руб", "-25 000 руб", "2 475 000 руб"] },
  { name: "Завод", standart: "-", deadline: "60", surety: "72", termsPayments: "10%", prices: ["2 500 000 руб", "-25 000 руб", "2 475 000 руб"] },
]

function App() {
  const nowDate = new Date().getTime()
  const twoMinutes = 120
  //общий старт торгов для вычисления очереди/времени при первой подгрузке
  const startAuction = new Date('Thu Dec 16 2022 8:56:12 GMT+0300 (Москва, стандартное время)').getTime()

  //разница от старта до "сейчас" в секундах
  const change = (nowDate - startAuction) / (1000)

  //действующее время при подгрузке
  const [nowCountDown, setNowCountDown] = useState(twoMinutes - change % twoMinutes)

  //вычисляем чья сейчас очередь таймера
  const [whoIsNext, setWhoIsNext] = useState(Math.floor(change / twoMinutes) % dataUsers.length)

  //функция, которая срабатывает по-истечению таймера
  const setNewTimer = (userIndex) => {
    //меняем таймера по индексу
    setWhoIsNext(userIndex !== dataUsers.length - 1 ? userIndex + 1 : 0)
    // сетаем 2 минуты
    setNowCountDown(twoMinutes)
  }

  const nameAuction = "Ход торгов Тестовые торги на аппарат ЛОТОС №2033555 (16.12.2022 11:20)"

  return (
    <div className="App">
      <header className="App-header">
        <div className="mainBLock">
          <div className="nameauction"> {nameAuction} </div>

          <div className="table">
            <BlockInfo
              standart="Наличие комплекса мероприятий, повышающих стандарты качества изготовления"
              deadline="Cрок изготовления лота, дней"
              surety="Гарантийные обязательства, мес"
              termsPayments="Условия оплаты"
              prices="Стоимость изготовления лота, руб (без НДС)"
              name="ПАРАМЕТРЫ И ТРЕБОВАНИЯ"
              timer={<div> ХОД </div>}
            />

            {dataUsers
              .map((user, i) =>
                <User
                  key={i}
                  user={user}
                  indexUser={i}
                  whoIsNext={whoIsNext}
                  setNewTimer={setNewTimer}
                  nowCountDown={nowCountDown} />)}
          </div>
        </div>
      </header>
    </div>
  )
}

export default App;

const User = ({ user, nowCountDown, whoIsNext, indexUser, setNewTimer }) => {
  const { name, standart, deadline, surety, termsPayments, prices } = user

  const Prices = () => <div className='prices'>
    <div className="main">
      {prices[0]}
    </div>
    <div className="discount">
      {prices[1]}
    </div>
    <div className="sell">
      {prices[2]}
    </div>
  </div>

  const Name = () => <div>
    <div>Участник № {indexUser + 1}</div>
    <div>"{name}</div>
  </div>

  return <BlockInfo
    standart={standart}
    deadline={deadline}
    surety={surety}
    termsPayments={termsPayments}
    prices={<Prices />}
    name={<Name />}
    timer={whoIsNext === indexUser &&
      <CountDown
        seconds={nowCountDown}
        setNewTimer={() => setNewTimer(indexUser)} />}
  />
}

const BlockInfo = ({ name, standart, deadline, surety, termsPayments, prices, timer }) => {
  return (
    <div className="blockInfo">
      <div className="timersBlock"> {timer} </div>
      <div className="namesBlock"> {name} </div>
      <div className="whiteBlock"> {standart} </div>
      <div className="grayBlock"> {deadline} </div>
      <div className="whiteBlock"> {surety} </div>
      <div className="grayBlock"> {deadline} </div>
      <div className="whiteBlock"> {termsPayments} </div>
      <div className="grayBlock"> {prices} </div>
    </div>
  )
}

const CountDown = ({ seconds, setNewTimer }) => {
  const [over, setOver] = useState(false)
  const [[m, s], setTime] = useState([Math.floor(seconds / 60), Math.ceil(seconds % 60)])

  const tick = () => {
    if (over) return

    if (m === 0 && s === 0) {
      setOver(true)
    } else if (s === 0) {
      setTime([m - 1, 59]);
    } else {
      setTime([m, s - 1]);
    }
  }

  useEffect(() => {
    const timerID = setInterval(tick, 1000)
    over && setNewTimer()
    return () => clearInterval(timerID)
  })

  return (
    <div className="timer">
      <div> {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}</div>
    </div>
  )
}
