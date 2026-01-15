import { useState } from 'react'
import TicketDetailDialog from './TicketDetailDialog'

const TicketSubjectCell = ({ ticket }) => {
  const [open, setOpen] = useState(false)

  if (!ticket) return null

  return (
    <>
      <button
        type="button"
        className="line-clamp-2 w-64 text-left text-primary hover:underline"
        onClick={() => setOpen(true)}
        title={ticket.subject}
      >
        {ticket.subject}
      </button>

      {open && (
        <TicketDetailDialog
          open={open}
          onOpenChange={setOpen}
          ticketId={ticket?.id}
          showTrigger={false}
        />
      )}
    </>
  )
}

export default TicketSubjectCell
