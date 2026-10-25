import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { LoginForm } from './components/admin/LoginForm'

function App() {

  return (
    <main>
      <h1>Krajowy system pomiaru sprzedaży pączków</h1>
      <LoginForm></LoginForm>
    </main>
  )
}

export default App
