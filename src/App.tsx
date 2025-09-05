import { RouterProvider } from 'react-router-dom'
import router from './router'
import DisclaimerModal from './components/DisclaimerModal'
import { useDisclaimerModal } from './hooks/useDisclaimerModal'
import './App.css'
import { Analytics } from '@vercel/analytics/react'

function App() {
  const { showModal, closeModal } = useDisclaimerModal();

  return (
    <>
      <RouterProvider router={router} />
      <DisclaimerModal
        isOpen={showModal}
        onClose={closeModal}
      />
      <Analytics />
    </>
  )
}

export default App
