import { useCallback, useEffect, useState } from 'react'
import { adminInvitationRequestApi } from './api/weddingCardApi'

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
}

const formatDate = (value) => new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value))

export default function InvitationRequestInbox() {
  const [requests, setRequests] = useState([])
  const [selected, setSelected] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [busy, setBusy] = useState(true)
  const [notice, setNotice] = useState(null)

  const load = useCallback(async () => {
    setBusy(true)
    setNotice(null)
    try {
      const response = await adminInvitationRequestApi.list(statusFilter)
      setRequests(response)
      setSelected((current) => response.find((item) => item.id === current?.id) || null)
    } catch (error) {
      setNotice({ type: 'error', text: error?.message || 'Requests could not be loaded.' })
    } finally {
      setBusy(false)
    }
  }, [statusFilter])

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [load])

  const open = async (id) => {
    setBusy(true)
    setNotice(null)
    try {
      setSelected(await adminInvitationRequestApi.get(id))
    } catch (error) {
      setNotice({ type: 'error', text: error?.message || 'Request could not be opened.' })
    } finally {
      setBusy(false)
    }
  }

  const updateStatus = async (status) => {
    if (!selected) return
    setBusy(true)
    try {
      await adminInvitationRequestApi.updateStatus(selected.id, status)
      setSelected((current) => ({ ...current, status }))
      setRequests((current) => current.map((item) => item.id === selected.id ? { ...item, status } : item))
      setNotice({ type: 'success', text: 'Request status updated.' })
    } catch (error) {
      setNotice({ type: 'error', text: error?.message || 'Status could not be updated.' })
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!selected || !window.confirm(`Delete the request from “${selected.fullName}”?`)) return
    setBusy(true)
    try {
      await adminInvitationRequestApi.remove(selected.id)
      setSelected(null)
      await load()
      setNotice({ type: 'success', text: 'Request deleted.' })
    } catch (error) {
      setNotice({ type: 'error', text: error?.message || 'Request could not be deleted.' })
      setBusy(false)
    }
  }

  return (
    <main className="admin-layout">
      <aside className="admin-list-panel">
        <div className="admin-list-head">
          <div><p className="manager-kicker">Inbox</p><h1>Requests</h1></div>
          <span className="admin-request-count">{requests.length}</span>
        </div>
        <div className="admin-list-meta">
          <select aria-label="Filter requests by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
          <button type="button" onClick={load} disabled={busy}>Refresh</button>
        </div>
        <div className="admin-card-list admin-request-list">
          {requests.map((request) => (
            <button key={request.id} type="button" aria-pressed={selected?.id === request.id} onClick={() => open(request.id)}>
              <span className={`admin-request-status ${request.status}`} />
              <span>
                <strong>{request.fullName}</strong>
                <small>{request.template || 'No template'} · {formatDate(request.createdAtUtc)}</small>
              </span>
              <span>→</span>
            </button>
          ))}
          {!busy && requests.length === 0 && <p className="admin-empty-list">No requests found.</p>}
        </div>
      </aside>

      <section className="admin-editor-panel">
        {notice && <div className={`manager-notice ${notice.type === 'error' ? 'manager-notice-error' : ''}`}>{notice.text}</div>}
        {!selected ? (
          <div className="manager-empty"><span>INBOX</span><h2>Select an invitation request.</h2></div>
        ) : (
          <div className="admin-request-detail">
            <div className="admin-editor-head">
              <div>
                <p>{formatDate(selected.createdAtUtc)}</p>
                <h2>{selected.fullName}</h2>
                <code>{selected.id}</code>
              </div>
              <button className="manager-danger" type="button" onClick={remove} disabled={busy}>Delete</button>
            </div>

            <div className="admin-request-actions">
              <a className="manager-primary" href={`tel:${selected.phone}`}>Call</a>
              <a className="manager-secondary" href={`mailto:${selected.email}`}>Email</a>
            </div>

            <dl className="admin-request-data">
              <div><dt>Phone</dt><dd>{selected.phone}</dd></div>
              <div><dt>Email</dt><dd>{selected.email}</dd></div>
              <div><dt>Template</dt><dd>{selected.template || 'Not selected'}</dd></div>
              <div><dt>Status</dt><dd>{STATUS_LABELS[selected.status] || selected.status}</dd></div>
              <div className="wide"><dt>Message</dt><dd>{selected.message || 'No message.'}</dd></div>
            </dl>

            <div className="admin-request-status-actions" aria-label="Request status">
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <button key={value} type="button" aria-pressed={selected.status === value} onClick={() => updateStatus(value)} disabled={busy}>{label}</button>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
