import { useState, useEffect } from 'react'
import useTrialExpiry from '@/hooks/useTrialExpiry'
import { CONTACT_INFO } from '@/config/trial'
import { cn } from '@/lib/utils'

// Pad number to 2 digits
const pad = (n) => String(n).padStart(2, '0')

// Single countdown unit block
const CountdownUnit = ({ value, label, expired }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className={cn(
        'flex h-14 w-14 items-center justify-center rounded-lg border text-2xl font-bold tabular-nums shadow-sm transition-all duration-300',
        expired
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : 'border-primary/30 bg-primary/10 text-primary',
      )}
    >
      {pad(value)}
    </div>
    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {label}
    </span>
  </div>
)

// Colon separator
const Colon = ({ expired }) => (
  <div
    className={cn(
      'mb-5 text-xl font-bold',
      expired ? 'text-destructive/60' : 'text-primary/60',
    )}
  >
    :
  </div>
)

const TrialExpiryModal = () => {
  const { days, hours, minutes, seconds, isExpired } = useTrialExpiry()
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    if (isExpired) return
    setIsVisible(false)
    setTimeout(() => setDismissed(true), 300)
  }

  if (dismissed) return null

  return (
    // Backdrop
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={!isExpired ? handleClose : undefined}
    >
      {/* Modal card */}
      <div
        className={cn(
          'relative mx-4 w-full max-w-sm transition-all duration-300',
          isVisible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-4 scale-95 opacity-0',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-lg border bg-background shadow-2xl">
          {/* Top color bar — matches sidebar primary color */}
          <div
            className={cn(
              'h-1.5 w-full',
              isExpired ? 'bg-destructive' : 'bg-primary',
            )}
          />

          <div className="p-6">
            {/* Icon + Title */}
            <div className="mb-4 flex flex-col items-center gap-3 text-center">
              {/* Icon circle */}
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full border-2',
                  isExpired
                    ? 'border-destructive/40 bg-destructive/10 text-destructive'
                    : 'border-primary/40 bg-primary/10 text-primary',
                )}
              >
                {isExpired ? (
                  // Warning icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                ) : (
                  // Clock icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>

              {/* Title */}
              <h2 className="text-base font-semibold leading-snug text-foreground">
                {isExpired
                  ? 'Hạn dùng thử phần mềm đã hết'
                  : 'Hạn dùng thử phần mềm còn lại'}
              </h2>
            </div>

            {/* Countdown (only if not expired) */}
            {!isExpired && (
              <div className="mb-5 flex flex-col items-center gap-3">
                {/* Days badge */}
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-md border px-4 py-2',
                    'border-primary/20 bg-primary/5',
                  )}
                >
                  <span className="text-4xl font-extrabold tabular-nums text-primary">
                    {days}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    ngày
                  </span>
                </div>

                {/* H : M : S */}
                <div className="flex items-end gap-1.5">
                  <CountdownUnit value={hours} label="Giờ" expired={false} />
                  <Colon expired={false} />
                  <CountdownUnit value={minutes} label="Phút" expired={false} />
                  <Colon expired={false} />
                  <CountdownUnit value={seconds} label="Giây" expired={false} />
                </div>
              </div>
            )}

            {/* Separator */}
            <div className="mb-4 border-t border-border" />

            {/* Contact info */}
            <p className="mb-5 text-center text-sm text-muted-foreground leading-relaxed">
              Xin liên hệ{' '}
              <a
                href={`tel:${CONTACT_INFO.phone}`}
                className={cn(
                  'font-semibold hover:underline',
                  isExpired ? 'text-destructive' : 'text-primary',
                )}
              >
                {CONTACT_INFO.phone}
              </a>{' '}
              <span className="font-medium text-foreground">
                ({CONTACT_INFO.name})
              </span>{' '}
              để được hỗ trợ và thanh toán gia hạn
            </p>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <a
                href={`tel:${CONTACT_INFO.phone}`}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
                  isExpired
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90',
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z"
                  />
                </svg>
                Gọi ngay {CONTACT_INFO.phone}
              </a>

              {!isExpired && (
                <button
                  onClick={handleClose}
                  className="rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Đóng và tiếp tục dùng thử
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrialExpiryModal
