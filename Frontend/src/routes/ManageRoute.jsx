import React, {useState} from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/Login'
import ChatPage from '../pages/ChatPage'


const ManageRoute = () => {
  const [user, setUser] = useState(null);
  return (
    <div>

   <Routes>

     <Route path='/' element={<HomePage/>}></Route>
     <Route path='/login' element={<LoginPage setUser={setUser}/>}></Route>
     <Route path='/chat' element={<ChatPage user={user} setUser={setUser}/>}></Route>

   </Routes>

    </div>
  )
}

export default ManageRoute