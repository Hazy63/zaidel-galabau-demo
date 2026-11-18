import { Route, Routes } from 'react-router-dom'
import { SessionProvider, useSession } from './session'
import Login from './Login'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import DocEditor from './pages/DocEditor'
import Plan from './pages/Plan'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Team from './pages/Team'
import { useEffect } from 'react'

function Gate() {
  const { me, ready } = useSession()
  useEffect(() => {
    document.title = 'Auftragsbuch · Zaidel'
    return () => {
      document.title = 'Zaidel Garten- und Landschaftsbau · Kleinheubach'
    }
  }, [])
  if (!ready) return <div className="grid min-h-dvh place-items-center text-sm text-stone-500">Lädt …</div>
  if (!me) return <Login />
  return (
    <Routes>
      <Route path="auftraege/:id/dokument/:docId" element={<DocEditor />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="auftraege" element={<Jobs />} />
        <Route path="auftraege/:id" element={<JobDetail />} />
        <Route path="plan" element={<Plan />} />
        <Route path="kunden" element={<Customers />} />
        <Route path="kunden/:id" element={<CustomerDetail />} />
        <Route path="team" element={<Team />} />
      </Route>
    </Routes>
  )
}

export default function CrmApp() {
  return (
    <SessionProvider>
      <Gate />
    </SessionProvider>
  )
}
