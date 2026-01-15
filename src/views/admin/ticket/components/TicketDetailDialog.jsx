import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

import { ticketStatuses, ticketPriorities, ticketChannels } from '../data'
import { useMemo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getTicketById } from '@/stores/TicketSlice'

// slice message
import {
  getTicketMessages,
  createStaffMessage,
  createCustomerMessage,
} from '@/stores/TicketMessageSlice'

// slice customer note
import {
  getCustomerNotes,
  createCustomerNote,
  deleteCustomerNote,
} from '@/stores/CustomerNoteSlice'

import TicketInfoTab from './tabs/TicketInfoTab'
import TicketMessagesTab from './tabs/TicketMessagesTab'
import TicketCustomerNotesTab from './tabs/TicketCustomerNotesTab'

const TicketDetailDialog = ({
  ticketId,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}) => {
  const dispatch = useDispatch()

  const { ticket, loading, error } = useSelector((state) => state.ticket)

  const {
    messages,
    loading: loadingMessages,
    pagination: messagesPagination,
  } = useSelector((state) => state.ticketMessage)

  const {
    notes,
    loading: loadingNotes,
    pagination: notesPagination,
  } = useSelector((state) => state.customerNote)

  const [localOpen, setLocalOpen] = useState(false)
  const isControlled = typeof controlledOpen !== 'undefined'
  const open = isControlled ? controlledOpen : localOpen

  const handleOpenChange = (value) => {
    if (!isControlled) setLocalOpen(value)
    onOpenChange?.(value)
  }

  const [newMessage, setNewMessage] = useState('')
  const [newMessageSender, setNewMessageSender] = useState('staff') // 'staff' | 'customer'

  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')

  useEffect(() => {
    if (open && ticketId && (!ticket || ticket.id !== ticketId)) {
      dispatch(getTicketById(ticketId))
    }
  }, [open, ticketId, ticket, dispatch])

  useEffect(() => {
    if (!open || !ticket) return

    dispatch(
      getTicketMessages({
        ticketId: ticket.id,
        params: { page: 1, limit: 50 },
      }),
    )

    if (ticket.customerId) {
      dispatch(
        getCustomerNotes({
          customerId: ticket.customerId,
          params: { page: 1, limit: 50 },
        }),
      )
    }
  }, [open, ticket, dispatch])

  const parsedMeta = useMemo(() => {
    if (!ticket?.meta) return {}
    try {
      return typeof ticket.meta === 'string'
        ? JSON.parse(ticket.meta)
        : ticket.meta
    } catch {
      return {}
    }
  }, [ticket?.meta])

  const status = ticketStatuses.find((s) => s.value === ticket?.status)
  const priority = ticketPriorities.find((p) => p.value === ticket?.priority)
  const channel = ticketChannels.find((c) => c.value === ticket?.channel)

  const metaTags =
    Array.isArray(parsedMeta.tags) && parsedMeta.tags.length
      ? parsedMeta.tags.join(', ')
      : parsedMeta.tags || ''

  const messagesPage = messagesPagination?.page || 1
  const messagesLimit = messagesPagination?.limit || 50
  const notesPage = notesPagination?.page || 1
  const notesLimit = notesPagination?.limit || 50

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    if (!ticket?.id) return

    const payload = { message: newMessage.trim() }

    if (newMessageSender === 'staff') {
      dispatch(
        createStaffMessage({
          ticketId: ticket.id,
          data: payload,
          params: { page: messagesPage, limit: messagesLimit },
        }),
      )
    } else {
      dispatch(
        createCustomerMessage({
          ticketId: ticket.id,
          data: payload,
          params: { page: messagesPage, limit: messagesLimit },
        }),
      )
    }

    setNewMessage('')
  }

  const handleCreateNote = () => {
    if (!ticket?.customerId) return
    if (!newNoteContent.trim()) return

    const payload = {
      title: newNoteTitle?.trim() || 'Ghi chú',
      content: newNoteContent.trim(),
    }

    dispatch(
      createCustomerNote({
        customerId: ticket.customerId,
        data: payload,
        params: { page: notesPage, limit: notesLimit },
      }),
    )

    setNewNoteTitle('')
    setNewNoteContent('')
  }

  const handleDeleteNote = (noteId) => {
    if (!ticket?.customerId) return
    dispatch(
      deleteCustomerNote({
        id: noteId,
        customerId: ticket.customerId,
        params: { page: notesPage, limit: notesLimit },
      }),
    )
  }

  if (loading && open) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Xem chi tiết
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="flex max-h-[85vh] w-[95vw] max-w-5xl flex-col">
          <DialogHeader>
            <Skeleton className="h-8 w-96" />
            <Skeleton className="mt-2 h-4 w-64" />
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error && open) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Xem chi tiết
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="w-[95vw] max-w-3xl">
          <div className="text-center text-red-600">
            Không thể tải chi tiết phiếu hỗ trợ. Vui lòng thử lại.
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!ticket) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Xem chi tiết
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="flex max-h-[85vh] w-[95vw] max-w-5xl flex-col">
        <DialogHeader>
          <DialogTitle className="mr-3 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span>
                Phiếu #{ticket.id}{' '}
                <span className="font-normal text-muted-foreground">
                  – {ticket.subject}
                </span>
              </span>
              {status && (
                <Badge variant={status.variant || 'outline'}>
                  {status.icon && <status.icon className="mr-2 h-4 w-4" />}
                  {status.label}
                </Badge>
              )}
            </div>
          </DialogTitle>

          <DialogDescription>
            Khách hàng:{' '}
            {ticket.customer ? (
              <>
                {ticket.customer.code ? ticket.customer.code + ' - ' : ''}
                {ticket.customer.name}
              </>
            ) : (
              'Không xác định'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 flex-1 overflow-y-auto">
          <Tabs defaultValue="info">
            <TabsList>
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="messages">Trao đổi</TabsTrigger>
              <TabsTrigger value="customer-notes">
                Ghi chú khách hàng
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <TicketInfoTab
                ticket={ticket}
                parsedMeta={parsedMeta}
                metaTags={metaTags}
                priority={priority}
                channel={channel}
              />
            </TabsContent>

            <TabsContent value="messages" className="mt-4">
              <TicketMessagesTab
                ticket={ticket}
                messages={messages || []}
                loading={!!loadingMessages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                newMessageSender={newMessageSender}
                setNewMessageSender={setNewMessageSender}
                onSend={handleSendMessage}
              />
            </TabsContent>

            <TabsContent value="customer-notes" className="mt-4">
              <TicketCustomerNotesTab
                ticket={ticket}
                notes={notes || []}
                loading={!!loadingNotes}
                newNoteTitle={newNoteTitle}
                setNewNoteTitle={setNewNoteTitle}
                newNoteContent={newNoteContent}
                setNewNoteContent={setNewNoteContent}
                onCreate={handleCreateNote}
                onDelete={handleDeleteNote}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TicketDetailDialog
