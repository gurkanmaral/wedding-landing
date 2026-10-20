import { useId, useMemo, useState } from 'react'
import { adminWeddingCardApi } from '../api/weddingCardApi'
import { ConfirmDialog, EmptyState, ErrorState, Icon, PageHeader, SkeletonRows, TemplateBadge } from './adminUi'
import {
  adminErrorText,
  cardDateText,
  cardEventTime,
  compareText,
  copyText,
  coupleName,
  isPublished,
  normalizeSearch,
} from './adminUtils'
import { invitationHref, templateLabel } from './templateDetails'

const SORTS = {
  name: { label: 'Çift adı', compare: (a, b) => compareText(coupleName(a), coupleName(b)) },
  date: {
    label: 'Tören tarihi',
    compare: (a, b) => (cardEventTime(a) ?? Infinity) - (cardEventTime(b) ?? Infinity),
  },
  template: { label: 'Şablon', compare: (a, b) => compareText(templateLabel(a.details?.template), templateLabel(b.details?.template)) },
}

const FILTERS = [
  { value: 'all', label: 'Tümü' },
  { value: 'published', label: 'Yayında' },
  { value: 'draft', label: 'Taslak' },
]

function SortHeader({ id, label, sort, onSort }) {
  const active = sort.key === id
  return (
    <th scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className={`wf-th-btn ${active ? 'is-active' : ''}`} onClick={() => onSort(id)}>
        {label}
        <span className="wf-th-btn__arrow" aria-hidden="true">{active ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>
  )
}

function LinkCell({ card, onCopy }) {
  const href = invitationHref(card.details)
  if (!href) return <span className="wf-muted">Bağlantı adresi yok</span>
  return (
    <div className="wf-link-cell">
      <code title={href}>/{card.details.slug}</code>
      <div className="wf-link-cell__actions">
        <a className="wf-btn wf-btn--ghost wf-btn--sm" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${coupleName(card)} davetiyesini yeni sekmede aç`}>
          <Icon name="external" size={15} /> Davetiyeyi aç
        </a>
        <button type="button" className="wf-icon-btn wf-icon-btn--sm" onClick={() => onCopy(href)} aria-label={`${coupleName(card)} bağlantısını kopyala`} title="Bağlantıyı kopyala">
          <Icon name="copy" size={16} />
        </button>
      </div>
    </div>
  )
}

function RowActions({ card, onEdit, onOpenRsvp, onDelete }) {
  const name = coupleName(card)
  return (
    <div className="wf-row-actions">
      <button type="button" className="wf-btn wf-btn--ghost wf-btn--sm" onClick={() => onEdit(card)} aria-label={`${name} davetiyesini düzenle`}><Icon name="edit" size={15} /> Düzenle</button>
      <button type="button" className="wf-icon-btn wf-icon-btn--sm" onClick={() => onOpenRsvp(card.id)} aria-label={`${name} için LCV yanıtlarını gör`} title="LCV yanıtları"><Icon name="rsvp" size={16} /></button>
      <button type="button" className="wf-icon-btn wf-icon-btn--sm wf-icon-btn--danger" onClick={() => onDelete(card)} aria-label={`${name} davetiyesini sil`} title="Sil"><Icon name="trash" size={16} /></button>
    </div>
  )
}

export default function CardsView({ cards, onRefresh, onCreate, onEdit, onOpenRsvp, onDeleted, onAuthError, notify }) {
  const searchId = useId()
  const sortId = useId()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState({ key: 'date', dir: 'asc' })
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const counts = useMemo(() => ({
    all: cards.data.length,
    published: cards.data.filter(isPublished).length,
    draft: cards.data.filter((card) => !isPublished(card)).length,
  }), [cards.data])

  const visible = useMemo(() => {
    const needle = normalizeSearch(query.trim())
    const filtered = cards.data.filter((card) => {
      if (filter === 'published' && !isPublished(card)) return false
      if (filter === 'draft' && isPublished(card)) return false
      if (!needle) return true
      const d = card.details || {}
      const haystack = normalizeSearch([card.name, d.partner1, d.partner2, d.slug, d.venue, d.city, templateLabel(d.template)].join(' '))
      return haystack.includes(needle)
    })
    const compare = SORTS[sort.key].compare
    const sorted = [...filtered].sort(compare)
    return sort.dir === 'asc' ? sorted : sorted.reverse()
  }, [cards.data, filter, query, sort])

  const toggleSort = (key) => setSort((current) => (
    current.key === key ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
  ))

  const copy = async (href) => {
    try {
      await copyText(`${window.location.origin}${href}`)
      notify('success', 'Davetiye bağlantısı panoya kopyalandı.')
    } catch {
      notify('error', 'Bağlantı kopyalanamadı. Tarayıcınız panoya erişime izin vermiyor olabilir.')
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await adminWeddingCardApi.remove(pendingDelete.id)
      notify('success', `“${coupleName(pendingDelete)}” davetiyesi silindi.`)
      setPendingDelete(null)
      await onDeleted(pendingDelete.id)
    } catch (error) {
      if (!onAuthError(error)) notify('error', adminErrorText(error, 'Davetiye silinemedi.'))
    } finally {
      setDeleting(false)
    }
  }

  const loading = cards.loading && !cards.data.length

  return (
    <div className="wf-page">
      <PageHeader
        eyebrow="Davetiyeler"
        title="Tüm davetiyeler"
        description="Çiftlerin davetiyelerini oluşturun, düzenleyin ve paylaşım bağlantılarını yönetin."
        actions={(
          <>
            <button type="button" className="wf-btn wf-btn--ghost" onClick={onRefresh} disabled={cards.loading}><Icon name="refresh" size={16} /> Yenile</button>
            <button type="button" className="wf-btn wf-btn--primary" onClick={onCreate}><Icon name="plus" size={16} /> Yeni davetiye</button>
          </>
        )}
      />

      <div className="wf-toolbar">
        <div className="wf-search">
          <label htmlFor={searchId} className="wf-sr-only">Davetiyelerde ara</label>
          <Icon name="search" size={17} />
          <input id={searchId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="İsim, bağlantı, mekân ya da şablon ara" />
        </div>
        <div className="wf-chips" role="group" aria-label="Yayın durumuna göre filtrele">
          {FILTERS.map((item) => (
            <button key={item.value} type="button" className="wf-chip" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>
              {item.label}<span>{counts[item.value]}</span>
            </button>
          ))}
        </div>
        <div className="wf-sort-mobile">
          <label htmlFor={sortId}>Sırala</label>
          <select id={sortId} value={`${sort.key}:${sort.dir}`} onChange={(event) => { const [key, dir] = event.target.value.split(':'); setSort({ key, dir }) }}>
            {Object.entries(SORTS).flatMap(([key, item]) => [
              <option key={`${key}:asc`} value={`${key}:asc`}>{item.label} (artan)</option>,
              <option key={`${key}:desc`} value={`${key}:desc`}>{item.label} (azalan)</option>,
            ])}
          </select>
        </div>
      </div>

      {cards.error && <ErrorState message={cards.error} onRetry={onRefresh} />}

      {loading ? (
        <div className="wf-panel"><SkeletonRows rows={6} label="Davetiyeler yükleniyor" /></div>
      ) : !cards.error && cards.data.length === 0 ? (
        <div className="wf-panel">
          <EmptyState
            icon="cards"
            title="Henüz hiç davetiye yok."
            action={<button type="button" className="wf-btn wf-btn--primary" onClick={onCreate}><Icon name="plus" size={16} /> İlk davetiyeyi oluştur</button>}
          >
            Bir çift için ilk davetiyeyi oluşturduğunuzda burada listelenecek.
          </EmptyState>
        </div>
      ) : visible.length === 0 && !cards.error ? (
        <div className="wf-panel">
          <EmptyState icon="search" title="Aramanızla eşleşen davetiye bulunamadı.">
            Farklı bir isim ya da bağlantı deneyin veya filtreleri temizleyin.
          </EmptyState>
        </div>
      ) : visible.length > 0 && (
        <>
          <p className="wf-result-count" aria-live="polite">{visible.length} davetiye gösteriliyor</p>
          <div className="wf-panel wf-table-wrap">
            <table className="wf-table">
              <caption className="wf-sr-only">Davetiye listesi, sütun başlıklarıyla sıralanabilir</caption>
              <thead>
                <tr>
                  <SortHeader id="name" label="Çift" sort={sort} onSort={toggleSort} />
                  <SortHeader id="template" label="Şablon" sort={sort} onSort={toggleSort} />
                  <SortHeader id="date" label="Tarih" sort={sort} onSort={toggleSort} />
                  <th scope="col">Bağlantı</th>
                  <th scope="col"><span className="wf-sr-only">İşlemler</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((card) => (
                  <tr key={card.id}>
                    <td>
                      <div className="wf-couple">
                        <strong>{coupleName(card)}</strong>
                        <span className={`wf-pill ${isPublished(card) ? 'wf-pill--live' : ''}`}>{isPublished(card) ? 'Yayında' : 'Taslak'}</span>
                      </div>
                      {(card.details?.venue || card.details?.city) && <small className="wf-muted">{[card.details?.venue, card.details?.city].filter(Boolean).join(' · ')}</small>}
                    </td>
                    <td><TemplateBadge template={card.details?.template} /></td>
                    <td className="wf-nowrap">{cardDateText(card) || <span className="wf-muted">Tarih yok</span>}</td>
                    <td><LinkCell card={card} onCopy={copy} /></td>
                    <td><RowActions card={card} onEdit={onEdit} onOpenRsvp={onOpenRsvp} onDelete={setPendingDelete} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="wf-card-list" aria-label="Davetiye listesi">
            {visible.map((card) => (
              <li key={card.id} className="wf-card-item">
                <div className="wf-card-item__head">
                  <div>
                    <strong>{coupleName(card)}</strong>
                    <small>{cardDateText(card) || 'Tarih yok'}</small>
                  </div>
                  <span className={`wf-pill ${isPublished(card) ? 'wf-pill--live' : ''}`}>{isPublished(card) ? 'Yayında' : 'Taslak'}</span>
                </div>
                <TemplateBadge template={card.details?.template} />
                <LinkCell card={card} onCopy={copy} />
                <RowActions card={card} onEdit={onEdit} onOpenRsvp={onOpenRsvp} onDelete={setPendingDelete} />
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Davetiye silinsin mi?"
        confirmLabel="Davetiyeyi sil"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        <p><strong>{pendingDelete && coupleName(pendingDelete)}</strong> davetiyesi ve tüm ayrıntıları kalıcı olarak silinecek. Paylaşılan bağlantı artık açılmayacak. Bu işlem geri alınamaz.</p>
      </ConfirmDialog>
    </div>
  )
}
