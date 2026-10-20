import { EmptyState, ErrorState, Icon, PageHeader, Skeleton, StatusBadge, TemplateBadge } from './adminUi'
import { formatDateTime, formatNumber } from './adminUtils'

function StatCard({ label, value, detail, loading, accent = false }) {
  return (
    <article className={`wf-stat ${accent ? 'wf-stat--accent' : ''}`}>
      <p className="wf-stat__label">{label}</p>
      {loading
        ? <><Skeleton width={72} height={34} /><Skeleton width="70%" height={12} /></>
        : <><p className="wf-stat__value">{formatNumber(value)}</p><p className="wf-stat__detail">{detail}</p></>}
    </article>
  )
}

export default function OverviewView({ stats, cards, requests, onRetry, onNavigate, onOpenRequest, onCreate }) {
  const data = stats.data
  const loading = stats.loading && !data
  const topTemplates = data?.topTemplates || []
  const maxCards = Math.max(1, ...topTemplates.map((item) => item.cards))
  const newest = [...requests.data]
    .sort((a, b) => new Date(b.createdAtUtc) - new Date(a.createdAtUtc))
    .slice(0, 5)

  return (
    <div className="wf-page">
      <PageHeader
        eyebrow="Genel bakış"
        title="Bugün neler oluyor?"
        description="Davetiyelerin, gelen taleplerin ve konuk yanıtlarının kısa özeti."
        actions={(
          <>
            <button type="button" className="wf-btn wf-btn--ghost" onClick={onRetry} disabled={stats.loading || cards.loading || requests.loading}>
              <Icon name="refresh" size={16} /> Yenile
            </button>
            <button type="button" className="wf-btn wf-btn--primary" onClick={onCreate}><Icon name="plus" size={16} /> Yeni davetiye</button>
          </>
        )}
      />

      {stats.error && <ErrorState message={stats.error} onRetry={onRetry} />}

      <section className="wf-stats" aria-label="Özet sayılar">
        <StatCard
          label="Davetiye"
          value={data?.cards}
          loading={loading}
          detail="Sistemdeki tüm davetiyeler"
        />
        <StatCard
          label="Yeni talep"
          value={data?.invitationRequests?.new}
          loading={loading}
          accent={(data?.invitationRequests?.new || 0) > 0}
          detail={`${formatNumber(data?.invitationRequests?.contacted)} iletişimde · ${formatNumber(data?.invitationRequests?.closed)} kapandı`}
        />
        <StatCard
          label="Son 30 gün LCV"
          value={data?.rsvps?.last30Days}
          loading={loading}
          detail={`Toplam ${formatNumber(data?.rsvps?.total)} yanıt`}
        />
        <StatCard
          label="Toplam katılan kişi"
          value={data?.rsvps?.guests}
          loading={loading}
          detail={`${formatNumber(data?.rsvps?.attending)} yanıt katılacağını bildirdi`}
        />
      </section>

      <div className="wf-overview-grid">
        <section className="wf-panel" aria-labelledby="wf-latest-title">
          <header className="wf-panel__head">
            <h2 id="wf-latest-title">En yeni talepler</h2>
            <button type="button" className="wf-link-btn" onClick={() => onNavigate('requests')}>Tümünü gör <Icon name="arrow" size={14} /></button>
          </header>
          {requests.loading && !requests.data.length ? (
            <ul className="wf-mini-list">
              {[0, 1, 2].map((index) => <li key={index} className="wf-mini-list__skeleton"><Skeleton width="40%" /><Skeleton width="25%" height={12} /></li>)}
            </ul>
          ) : requests.error ? (
            <ErrorState message={requests.error} onRetry={onRetry} />
          ) : newest.length === 0 ? (
            <EmptyState icon="inbox" title="Henüz talep yok.">Sitedeki iletişim formundan gelen davetiye talepleri burada görünecek.</EmptyState>
          ) : (
            <ul className="wf-mini-list">
              {newest.map((request) => (
                <li key={request.id}>
                  <button type="button" className="wf-mini-list__row" onClick={() => onOpenRequest(request.id)}>
                    <span className="wf-mini-list__main">
                      <strong>{request.fullName}</strong>
                      <small>{request.template ? <TemplateBadge template={request.template} /> : 'Şablon belirtilmedi'} <span>{formatDateTime(request.createdAtUtc)}</span></small>
                    </span>
                    <StatusBadge status={request.status} />
                    <Icon name="arrow" size={16} className="wf-mini-list__chev" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="wf-panel" aria-labelledby="wf-top-title">
          <header className="wf-panel__head">
            <h2 id="wf-top-title">En çok kullanılan şablonlar</h2>
            <button type="button" className="wf-link-btn" onClick={() => onNavigate('cards')}>Davetiyeler <Icon name="arrow" size={14} /></button>
          </header>
          {loading ? (
            <ul className="wf-bars">{[0, 1, 2, 3].map((index) => <li key={index}><Skeleton width="45%" /><Skeleton height={8} radius={999} /></li>)}</ul>
          ) : topTemplates.length === 0 ? (
            <EmptyState icon="cards" title="Henüz şablon kullanımı yok.">İlk davetiyeyi oluşturduğunuzda en çok tercih edilen şablonlar burada listelenir.</EmptyState>
          ) : (
            <ol className="wf-bars">
              {topTemplates.map((item) => (
                <li key={item.template}>
                  <div className="wf-bars__label">
                    <TemplateBadge template={item.template} />
                    <span>{formatNumber(item.cards)} davetiye</span>
                  </div>
                  <span className="wf-bars__track" aria-hidden="true"><span style={{ width: `${(item.cards / maxCards) * 100}%` }} /></span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}
