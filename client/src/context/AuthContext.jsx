import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pp-user')) } catch { return null }
  })

  const login = (userData, token) => {
    localStorage.setItem('pp-token', token)
    localStorage.setItem('pp-user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('pp-token')
    localStorage.removeItem('pp-user')
    setUser(null)
  }

  const updateUser = (userData) => {
    const updated = { ...user, ...userData }
    localStorage.setItem('pp-user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
