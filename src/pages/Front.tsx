import { Loading, Problem } from '../components/Status'
import { paper } from '../editions/paper'
import { getFront } from '../lib/press'
import { useMe } from '../state/MeContext'
import { useLoad } from '../state/useLoad'
import { useTitle } from '../state/useTitle'

export default function Front() {
  const { token } = useMe()
  const { data, error, loading } = useLoad(() => getFront(token), `front:${token}`)
  useTitle(null)
  if (loading) return <Loading />
  if (error || !data) return <Problem message={error ?? 'Noe gikk galt'} />
  return <paper.Front front={data.front} latest={data.latest} />
}
