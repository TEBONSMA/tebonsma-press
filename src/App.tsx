import { useEffect } from 'react'
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { edition } from './edition'
import { paper } from './editions/paper'
import MembersPrompt from './components/MembersPrompt'
import ArticlePage from './pages/ArticlePage'
import Archive from './pages/Archive'
import AuthCallback from './pages/AuthCallback'
import Front from './pages/Front'
import NotFound from './pages/NotFound'
import SectionPage from './pages/SectionPage'
import ArrangeFront from './pages/desk/ArrangeFront'
import EditMenu from './pages/desk/EditMenu'
import Desk from './pages/desk/Desk'
import EditArticle from './pages/desk/EditArticle'
import { MeProvider } from './state/MeProvider'

function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <paper.Header />
      <MembersPrompt />
      <main className="flex-1">
        <Outlet />
      </main>
      <paper.Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MeProvider>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route element={<Layout />}>
              <Route index element={<Front />} />
              <Route path={`${edition.articlePath}/:slug`} element={<ArticlePage />} />
              <Route path={`${edition.sectionPath}/:section`} element={<SectionPage />} />
              <Route path="arkiv" element={<Archive />} />
              <Route path="redaksjon" element={<Desk />} />
              <Route path="redaksjon/ny" element={<EditArticle />} />
              <Route path="redaksjon/sak/:id" element={<EditArticle />} />
              <Route path="redaksjon/forside" element={<ArrangeFront />} />
              <Route path="redaksjon/meny" element={<EditMenu />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </MeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
