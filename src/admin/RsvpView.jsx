import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { adminRsvpApi } from '../api/weddingCardApi'
import { AttendBadge, ConfirmDialog, EmptyState, ErrorState, Icon, PageHeader, Skeleton, SkeletonRows, Spinner } from './adminUi'
import { adminErrorText, cardDateText, compareText, coupleName, formatDateTime, formatNumber } from './adminUtils'
import { invitationHref } from './templateDetails'

const EMPTY = { totals: { responses: 0, attending: 0, declined: 0, guests: 0 }, items: [] }

function Totals({ totals, loading }) {
  const tiles = [
    ['Yanıt', totals.responses],
    ['Katılıyor', totals.attending],
    ['Katılmıyor', totals.declined],
    ['Toplam kişi', totals.guests],
  ]
  return (
    <section className="wf-stats wf-stats--compact" aria-label="LCV özeti">
      {tiles.map(([label, value], index) => (
        <article key={label} className={`wf-stat ${index === 3 ? 'wf-stat--accent' : ''}`}>
          <p className="wf-stat__label">{label}</p>
          {loading ? <Skeleton width={56} height={30} /> : <p className="wf-stat__value">{formatNumber(value)}</p>}
        </article>
      ))}
    </section>
  )
}

export default function RsvpView({ cards, cardId, onSelectCard, onChanged, onAuthError, notify }) {
  const pickerId = useId()
  const [state, setState] = useState({ cardId: null, data: EMPTY, loading: false, error: null })
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const options = useMemo(
    () => [...cards.data].sort((a, b) => compareText(coupleName(a), coupleName(b))),
    [cards.data],
  )
  const card = cards.data.find((item) => item.id === cardId) || null

  const load = useCallback(async (id) => {
    setState((current) => ({ ...current, cardId: id, loading: true, error: null }))
    try {
      const data = await adminRsvpApi.list(id)
      setState({ cardId: id, data: { totals: data?.totals || EMPTY.totals, items: data?.items || [] }, loading: false, error: null })
    } catch (error) {
      if (onAuthError(error)) return
      setState({ cardId: id, data: EMPTY, loading: false, error: adminErrorText(error, 'LCV yanıtları yüklenemedi.') })
    }
  }, [onAuthError])

  useEffect(() => {
    if (!cardId) return
    void Promise.resolve().then(() => load(cardId))
  }, [cardId, load])

  const items = useMemo(
    () => [...(state.cardId === cardId ? state.data.items : [])].sort((a, b) => new Date(b.createdAtUtc) - new Date(a.createdAtUtc)),
    [cardId, state.cardId, state.data.items],
  )
  const totals = state.cardId === cardId ? state.data.totals : EMPTY.totals
  const loading = Boolean(cardId) && (state.cardId !== cardId || state.loading)

  const exportCsv = async () => {
    if (!card) return
    setExporting(true)
    try {
      await adminRsvpApi.downloadCsv(card.id, `lcv-${card.details?.slug || card.id}.csv`)
      notify('success', 'LCV listesi indirildi. Dosyayı Excel ile açabilirsiniz.')
    } catch (error) {
      if (!onAuthError(error)) notify('error', adminErrorText(error, 'LCV listesi indirilemedi.'))
    } finally {
      setExporting(false)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete || !card) return
    setDeleting(true)
    try {
      await adminRsvpApi.remove(card.id, pendingDelete.id)
      notify('success', `${pendingDelete.name} adlı konuğun yanıtı silindi.`)
      setPendingDelete(null)
      await load(card.id)
      onChanged()
    } catch (error) {
      if (!onAuthError(error)) notify('error', adminErrorText(error, 'Yanıt silinemedi.'))
    } finally {
      setDeleting(false)
    }
  }

  const href = card ? invitationHref(card.details) : null

  return (
    <div className="wf-page">
      <PageHeader
        eyebrow="LCV"
        title="Konuk yanıtları"
        description="Bir davetiye seçin; katılım yanıtlarını görün, gereksiz kayıtları silin ve listeyi Excel’e aktarın."
        actions={card && (
          <>
            <button type="button" className="wf-btn wf-btn--ghost" onClick={() => load(card.id)} disabled={loading}><Icon name="refresh" size={16} /> Yenile</button>
            <button type="button" className="wf-btn wf-btn--primary" onClick={exportCsv} disabled={exporting || loading || items.length === 0}>
              {exporting ? <><Spinner label="Hazırlanıyor" /> Hazırlanıyor…</> : <><Icon name="download" size={16} /> Excel’e aktar (CSV)</>}
            </button>
          </>
        )}
      />

      <div className="wf-panel wf-picker">
        <label htmlFor={pickerId}>Davetiye</label>
        {cards.loading && !cards.data.length ? (
          <Skeleton height={44} radius={10} />
        ) : (
          <select id={pickerId} value={cardId || ''} onChange={(event) => onSelectCard(event.target.value)} disabled={!options.length}>
            <option value="">{options.length ? 'Bir davetiye seçin…' : 'Henüz davetiye yok'}</option>
            {options.map((item) => (
              <option key={item.id} value={item.id}>
                {coupleName(item)}{item.details?.slug ? ` — /${item.details.slug}` : ''}{cardDateText(item) ? ` · ${cardDateText(item)}` : ''}
              </option>
            ))}
          </select>
        )}
        {href && <a className="wf-inline-link" href={href} target="_blank" rel="noopener noreferrer">Davetiyeyi aç <Icon name="external" size={13} /></a>}
      </div>

      {cards.error && <ErrorState message={cards.error} />}

      {!card ? (
        <div className="wf-panel">
          <EmptyState icon="rsvp" title="Önce bir davetiye seçin.">Konukların katılım yanıtlarını görmek için yukarıdaki listeden bir davetiye seçin.</EmptyState>
        </div>
      ) : (
        <>
          <Totals totals={totals} loading={loading} />
          {state.error && state.cardId === cardId && <ErrorState message={state.error} onRetry={() => load(card.id)} />}
          {loading ? (
            <div className="wf-panel"><SkeletonRows rows={5} label="Yanıtlar yükleniyor" /></div>
          ) : !state.error && items.length === 0 ? (
            <div className="wf-panel">
              <EmptyState icon="rsvp" title="Bu davetiyeye henüz yanıt gelmedi.">Konuklar davetiyedeki LCV formunu doldurdukça yanıtlar burada listelenecek.</EmptyState>
            </div>
          ) : items.length > 0 && (
            <>
              <div className="wf-panel wf-table-wrap">
                <table className="wf-table">
                  <caption className="wf-sr-only">{coupleName(card)} davetiyesine gelen LCV yanıtları</caption>
                  <thead>
                    <tr>
                      <th scope="col">Konuk</th>
                      <th scope="col">Katılım</th>
                      <th scope="col" className="wf-num">Kişi</th>
                      <th scope="col">Not</th>
                      <th scope="col">Şarkı isteği</th>
                      <th scope="col">Tarih</th>
                      <th scope="col"><span className="wf-sr-only">İşlemler</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.name}</strong></td>
                        <td><AttendBadge attending={item.attending} /></td>
                        <td className="wf-num">{item.attending ? formatNumber(item.guests) : '—'}</td>
                        <td className="wf-cell-text">{item.note || <span className="wf-muted">—</span>}</td>
                        <td className="wf-cell-text">{item.song || <span className="wf-muted">—</span>}</td>
                        <td className="wf-nowrap">{formatDateTime(item.createdAtUtc)}</td>
                        <td>
                          <button type="button" className="wf-icon-btn wf-icon-btn--sm wf-icon-btn--danger" onClick={() => setPendingDelete(item)} aria-label={`${item.name} adlı konuğun yanıtını sil`} title="Yanıtı sil">
                            <Icon name="trash" size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="wf-card-list" aria-label="LCV yanıtları">
                {items.map((item) => (
                  <li key={item.id} className="wf-card-item">
                    <div className="wf-card-item__head">
                      <div>
                        <strong>{item.name}</strong>
                        <small>{formatDateTime(item.createdAtUtc)}</small>
                      </div>
                      <AttendBadge attending={item.attending} />
                    </div>
                    <dl className="wf-mini-facts">
                      {item.attending && <div><dt>Kişi</dt><dd>{formatNumber(item.guests)}</dd></div>}
                      {item.note && <div><dt>Not</dt><dd>{item.note}</dd></div>}
                      {item.song && <div><dt>Şarkı</dt><dd>{item.song}</dd></div>}
                    </dl>
                    <div className="wf-row-actions">
                      <button type="button" className="wf-btn wf-btn--danger-ghost wf-btn--sm" onClick={() => setPendingDelete(item)}><Icon name="trash" size={15} /> Yanıtı sil</button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Yanıt silinsin mi?"
        confirmLabel="Yanıtı sil"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        <p><strong>{pendingDelete?.name}</strong> adlı konuğun LCV yanıtı kalıcı olarak silinecek ve toplamlardan düşülecek. Bu işlem geri alınamaz.</p>
      </ConfirmDialog>
    </div>
  )
}
